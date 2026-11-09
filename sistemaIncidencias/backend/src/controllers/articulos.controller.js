
import pool from '../../config/db.js';
import { supabase, bucket } from '../../config/supabase.js';

// Devuelve el archivo asociado al articulo (o null). La columna `contenido`
// es bytea y guarda la ruta del bucket, por eso se convierte a texto.
const getArchivoArticulo = async (db, articuloId) => {
    const query = `
        SELECT arch.id_archivo, arch.nombre, arch.tipo,
               convert_from(arch.contenido, 'UTF8') AS ruta
        FROM articulos_archivos aa
        INNER JOIN archivos arch ON arch.id_archivo = aa.id_archivo
        WHERE aa.id_articulo = $1
        LIMIT 1;
    `;
    const result = await db.query(query, [articuloId]);
    return result.rows[0] ?? null;
};

const toActivo = (valor) => (valor === true || valor === 'true' || valor === 1 || valor === '1') ? 1 : 0;

const getArticulos = async (req, res) => {
    // ejemplo de respuesta a un get
    try {
        // row_to_json(tabla_join) sintaxis para que postgres retorne la relacion como objeto.
        const query = `
    SELECT
        art.*,
        row_to_json(ar) AS area, 
        row_to_json(cat) AS categoria 
    FROM articulos art
    INNER JOIN areas ar
        ON ar.id_area = art.id_area
    INNER JOIN categorias cat
        ON cat.id_categoria = art.id_categoria
    WHERE art.activo = 1;
    `;
        const result = await pool.query(query);
        const articulos = result.rows;
        return res.status(200).json(articulos);
    } catch (error) {
        console.log("🚀 ~ getArticulos ~ error:", error)
        return res.status(500).json({ mensaje: 'Ocurrio un error al recuperar los articulos', error });
    }

};


// Dentro de cada metodo usar la logica de manejo de datos necesaria
const getArticulo = async (req, res) => {
    //Agregar manejo de errores 
    const { id } = req.params; //Solo para ejemplo lo que recibimos en el id es el index desde el front

    try {
        if (!id) {
            return res.status(500).json({ mensaje: 'Se requiere el id de la categoria' });
        }

        const query = `
        SELECT * FROM articulos where id_articulo=$1;
        `;
        const result = await pool.query(query, [id]);
        const articulo = result.rows[0];

        if (!articulo) {
            return res.status(404).json({ mensaje: 'Articulo no encontrado' });
        }

        // Adjuntamos el archivo (si tiene) con una URL firmada para poder mostrarlo
        const archivo = await getArchivoArticulo(pool, id);
        articulo.archivo = null;
        if (archivo) {
            const { data, error } = await supabase.storage
                .from(bucket)
                .createSignedUrl(archivo.ruta, 60 * 60);

            articulo.archivo = {
                id_archivo: archivo.id_archivo,
                nombre: archivo.nombre,
                tipo: archivo.tipo,
                url: error ? null : data.signedUrl
            };
        }

        return res.status(200).json(articulo);
    } catch (error) {
        console.log("🚀 ~ getArticulo ~ error:", error)
        return res.status(500).json({ mensaje: 'Ocurrio un error al recuperar el articulo' });
    }

};

const createArticulo = async (req, res) => {
    const {
        areaId, categoriaId, descripcion, activo
    } = req.body;

    const archivo = req.file;

    if (!descripcion) {
        return res.status(500).json({ mensaje: 'Descripcion obligatoria' });
    }
    if (!activo) {
        return res.status(500).json({ mensaje: 'Se debe indicar el estado de la categoria' });
    }


    const client = await pool.connect();
    let rutaSubida = null;

    try {
        await client.query('BEGIN');

        const query = `
        INSERT INTO articulos (id_area, id_categoria, descripcion,activo)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `;
        const activoNumber = activo === 'true' ? 1 : 0;
        const values = [Number(areaId), Number(categoriaId), descripcion, activoNumber];
        let result = await client.query(query, values);

        if (archivo) {
            const nombre = archivo.originalname
            const tipo = archivo.mimetype
            const tamanio = archivo.size
            const fecha_creacion = new Date();
            // memoryStorage no genera path: todos los archivos van a la carpeta articulos/ del bucket.
            // El timestamp evita choques de nombre (upsert: false falla si el archivo ya existe)
            const ruta = `articulos/${Date.now()}-${nombre}`;

            const { error } = await supabase.storage
                .from(bucket)
                .upload(ruta, archivo.buffer, {
                    contentType: tipo,
                    upsert: false
                });

            if (error) {
                console.error(error);
                await client.query('ROLLBACK');
                return res.status(500).json({
                    mensaje: 'No se pudo subir el archivo'
                });
            }
            rutaSubida = ruta;

            const queryArchivo = ` 
                INSERT INTO archivos (nombre, tipo, tamanio,contenido,fecha_creacion)
                    VALUES ($1, $2, $3, $4,$5)
                    RETURNING *;`;

            const dataArchivo = [nombre, tipo, tamanio, ruta, fecha_creacion];
            let archivoCreado = await client.query(queryArchivo, dataArchivo);

            const queryArchivoArticulo = ` 
            INSERT INTO articulos_archivos (id_articulo, id_archivo)
                VALUES ($1, $2)
                RETURNING *;`;

            const archivoId = archivoCreado.rows[0].id_archivo
            const articuloId = result.rows[0].id_articulo

            const relation = [articuloId, archivoId];
            await client.query(queryArchivoArticulo, relation);
        }

        await client.query('COMMIT');
        return res.status(200).json({ mensaje: 'Articulo con éxito' });
    } catch (error) {
        console.log("🚀 ~ createArticulo ~ error:", error)
        await client.query('ROLLBACK');
        // La BD no se guardo: sacamos del bucket el archivo que se habia subido
        if (rutaSubida) {
            const { error: errorStorage } = await supabase.storage.from(bucket).remove([rutaSubida]);
            if (errorStorage) console.error('No se pudo borrar el archivo subido del bucket', errorStorage);
        }

        return res.status(500).json({ mensaje: 'Ocurrio un error en la creacion del articulo' });
    } finally {
        client.release();
    }
};

const updateArticulo = async (req, res) => {
    const { id } = req.params;
    const {
        areaId, categoriaId, descripcion, activo, eliminarArchivo
    } = req.body;
    const archivo = req.file;
    const quitarArchivo = eliminarArchivo === 'true' || eliminarArchivo === true;

    if (!descripcion) {
        return res.status(500).json({ mensaje: 'Descripcion obligatoria' });
    }
    if (!areaId) {
        return res.status(500).json({ mensaje: 'Area obligatoria' });
    } if (!categoriaId) {
        return res.status(500).json({ mensaje: 'Categoria obligatoria' });
    }

    const client = await pool.connect();
    let rutaSubida = null;      
    let rutaAEliminar = null;   

    try {
        await client.query('BEGIN');

        const query = `UPDATE articulos
                        SET
                            id_area= $1,
                            id_categoria= $2,
                            descripcion = $3,
                            activo = $4
                        WHERE id_articulo = $5
                        RETURNING *;
                        `;
        const values = [Number(areaId), Number(categoriaId), descripcion, toActivo(activo), Number(id)];
        const result = await client.query(query, values);

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ mensaje: 'Articulo no encontrado' });
        }

        if (archivo || quitarArchivo) {
            const archivoActual = await getArchivoArticulo(client, id);
            if (archivoActual) {
                await client.query(
                    'DELETE FROM articulos_archivos WHERE id_articulo = $1 AND id_archivo = $2;',
                    [Number(id), archivoActual.id_archivo]
                );
                await client.query('DELETE FROM archivos WHERE id_archivo = $1;', [archivoActual.id_archivo]);
                rutaAEliminar = archivoActual.ruta;
            }
        }

        if (archivo) {
            const nombre = archivo.originalname;
            const tipo = archivo.mimetype;
            const tamanio = archivo.size;
            const fecha_creacion = new Date();
            const ruta = `articulos/${Date.now()}-${nombre}`;

            const { error } = await supabase.storage
                .from(bucket)
                .upload(ruta, archivo.buffer, {
                    contentType: tipo,
                    upsert: false
                });

            if (error) {
                console.error(error);
                await client.query('ROLLBACK');
                return res.status(500).json({ mensaje: 'No se pudo subir el archivo' });
            }
            rutaSubida = ruta;

            const archivoCreado = await client.query(
                `INSERT INTO archivos (nombre, tipo, tamanio, contenido, fecha_creacion)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING *;`,
                [nombre, tipo, tamanio, ruta, fecha_creacion]
            );

            await client.query(
                'INSERT INTO articulos_archivos (id_articulo, id_archivo) VALUES ($1, $2);',
                [Number(id), archivoCreado.rows[0].id_archivo]
            );
        }

        await client.query('COMMIT');

        if (rutaAEliminar) {
            const { error } = await supabase.storage.from(bucket).remove([rutaAEliminar]);
            if (error) console.error('No se pudo borrar el archivo anterior del bucket', error);
        }

        return res.status(200).json({ mensaje: 'Articulo actualizado con éxito' });
    } catch (error) {
        console.log("🚀 ~ updateArticulo ~ error:", error)
        await client.query('ROLLBACK');
        // La BD no se actualizo: sacamos del bucket el archivo que se habia subido
        if (rutaSubida) {
            await supabase.storage.from(bucket).remove([rutaSubida]);
        }
        return res.status(500).json({ mensaje: 'Ocurrio un error al actualizar el articulo' });
    } finally {
        client.release();
    }
};

// Agregar manejo de errores
const deleteArticulo = async (req, res) => {
    const { id } = req.params;
    const articuloId = Number(id);


    try {
        const query = `UPDATE articulos SET activo = 0  WHERE id_articulo = $1 RETURNING *;`;
        
        await pool.query(query, [articuloId]);
        
        return res.status(200).json({ mensaje: 'Categoría eliminada con éxito' });


    } catch (error) {
        console.log("🚀 ~ deleteArticulo ~ error:", error)
        return res.status(500).json({ mensaje: 'Ocurrio un error al eliminar la categoria' });

    }



};

export {
    getArticulos,
    getArticulo,
    createArticulo,
    updateArticulo,
    deleteArticulo
};