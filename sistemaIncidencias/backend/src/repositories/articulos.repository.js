import pool from "../../config/db.js";
import { supabase, bucket } from '../../config/supabase.js';

// multer decodifica originalname como latin1: lo reinterpretamos como utf8 para recuperar tildes/ñ
const nombreOriginal = (archivo) => Buffer.from(archivo.originalname, 'latin1').toString('utf8');
// Supabase Storage rechaza claves con caracteres especiales: dejamos solo ASCII seguro
const claveSegura = (nombre) =>
    nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_');
export default class ArticuloRepository {
    ;

    getArticulos = async () => {
        const sql = `
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

        const { rowCount, rows } = await pool.query(sql);

        if (rowCount === 0) {
            return null;
        }

        return rows;
    };

    getArticulo = async (id) => {
        const sql = `
      SELECT
          *
      FROM 
          articulos
      WHERE 
          id_articulo = $1 AND activo = 1;
    `;

        const { rowCount, rows } = await pool.query(sql, [id]);

        if (rowCount === 0) {
            return null;
        }

        const articulo = rows[0];

        const { rows: archivos } = await pool.query(
            `SELECT arch.id_archivo, arch.nombre, arch.tipo, arch.contenido AS ruta
             FROM articulos_archivos aa
             INNER JOIN archivos arch ON arch.id_archivo = aa.id_archivo
             WHERE aa.id_articulo = $1
             LIMIT 1;`,
            [id]
        );
        articulo.archivo = null;
        if (archivos[0]) {
            const { id_archivo, nombre, tipo } = archivos[0];
            let ruta = archivos[0].ruta;
            if (Buffer.isBuffer(ruta)) ruta = ruta.toString('utf8');
            const { data, error } = await supabase.storage.from(bucket).createSignedUrl(ruta, 3600);
            if (error) console.error('No se pudo generar la URL del archivo', error);
            articulo.archivo = { id_archivo, nombre, tipo, url: data?.signedUrl ?? null };
        }

        return articulo;
    };

    createArticulo = async (articulo) => {
        const {
            areaId, categoriaId, descripcion, activo
        } = articulo;

        const archivo = articulo.file;


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
                const nombre = nombreOriginal(archivo)
                const tipo = archivo.mimetype
                const tamanio = archivo.size
                const fecha_creacion = new Date();
                // memoryStorage no genera path: todos los archivos van a la carpeta articulos/ del bucket.
                // El timestamp evita choques de nombre (upsert: false falla si el archivo ya existe)
                const ruta = `articulos/${Date.now()}-${claveSegura(nombre)}`;

                const { error } = await supabase.storage
                    .from(bucket)
                    .upload(ruta, archivo.buffer, {
                        contentType: tipo,
                        upsert: false
                    });

                if (error) {
                    console.error(error);
                    await client.query('ROLLBACK');

                    return null
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
            return result;
        } catch (error) {
            console.log("🚀 ~ createArticulo ~ error:", error)
            await client.query('ROLLBACK');
            // La BD no se guardo: sacamos del bucket el archivo que se habia subido
            if (rutaSubida) {
                const { error: errorStorage } = await supabase.storage.from(bucket).remove([rutaSubida]);
                if (errorStorage) console.error('No se pudo borrar el archivo subido del bucket', errorStorage);
            }

        } finally {
            client.release();
        }
    };

    updateArticulo = async (articulo) => {
        const { id } = articulo;
        const {
            areaId, categoriaId, descripcion, activo, eliminarArchivo
        } = articulo;
        const archivo = articulo.file;
        const quitarArchivo = eliminarArchivo === 'true' || eliminarArchivo === true;
        const toActivo = (valor) => (valor === true || valor === 'true' || valor === 1 || valor === '1') ? 1 : 0;
        const getArchivoArticulo = async (db, articuloId) => {
            const query = `
            SELECT arch.id_archivo, arch.nombre, arch.tipo,
                arch.contenido AS ruta
            FROM articulos_archivos aa
            INNER JOIN archivos arch ON arch.id_archivo = aa.id_archivo
            WHERE aa.id_articulo = $1
            LIMIT 1;
        `;
            const result = await db.query(query, [articuloId]);
            const fila = result.rows[0] ?? null;
            // contenido puede venir como Buffer (bytea) o string (text): normalizamos a string
            if (fila && Buffer.isBuffer(fila.ruta)) fila.ruta = fila.ruta.toString('utf8');
            return fila;
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
                return null;
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
                const nombre = nombreOriginal(archivo);
                const tipo = archivo.mimetype;
                const tamanio = archivo.size;
                const fecha_creacion = new Date();
                const ruta = `articulos/${Date.now()}-${claveSegura(nombre)}`;

                const { error } = await supabase.storage
                    .from(bucket)
                    .upload(ruta, archivo.buffer, {
                        contentType: tipo,
                        upsert: false
                    });

                if (error) {
                    console.error(error);
                    await client.query('ROLLBACK');
                    return 'No se pudo subir el archivo';
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
            return result;
        } catch (error) {
            console.log("🚀 ~ updateArticulo ~ error:", error)
            await client.query('ROLLBACK');
            // La BD no se actualizo: sacamos del bucket el archivo que se habia subido
            if (rutaSubida) {
                await supabase.storage.from(bucket).remove([rutaSubida]);
            }
            return null;
        } finally {
            client.release();
        }
    };

    deleteArticulo = async (id) => {
        const sql = `
      UPDATE
          articulos
      SET
          activo = 0
      WHERE
          id_articulo = $1
      RETURNING *;
    `;

        const { rowCount, rows } = await pool.query(sql, [id]);

        if (rowCount === 0) {
            return null;
        }

        return rows[0];
    };
}
