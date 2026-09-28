
import pool from '../../config/db.js';

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
        SELECT * FROM categorias where id_categoria=$1;
        `;
        const result = await pool.query(query, [id]);
        const categorias = result.rows;
        return res.status(200).json(categorias);
    } catch (error) {
        console.log("🚀 ~ createArticulo ~ error:", error)
        return res.status(500).json({ mensaje: 'Ocurrio un error al recuperar la categoria' });
    }

};

const createArticulo = async (req, res) => {
    const {
        areaId, categoriaId, descripcion, activo
    } = req.body;
    if (!descripcion) {
        return res.status(500).json({ mensaje: 'Descripcion obligatoria' });
    }
    if (!activo) {
        return res.status(500).json({ mensaje: 'Se debe indicar el estado de la categoria' });
    }


    try {
        const query = `
        INSERT INTO articulos (id_area, id_categoria, descripcion,activo)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `;
        const values = [Number(areaId), Number(categoriaId), descripcion, Number(activo)];
        const result = await pool.query(query, values);

        return res.status(200).json({ mensaje: 'Articulo con éxito' });
    } catch (error) {
        console.log("🚀 ~ createArticulo ~ error:", error)
        return res.status(500).json({ mensaje: 'Ocurrio un error en la creacion del articulo' });
    }


};

const updateArticulo = async (req, res) => {
    const { id } = req.params;
    const {
        areaId, categoriaId, descripcion, activo
    } = req.body;

    if (!descripcion) {
        return res.status(500).json({ mensaje: 'Descripcion obligatoria' });
    }
    if (!areaId) {
        return res.status(500).json({ mensaje: 'Area obligatoria' });
    } if (!categoriaId) {
        return res.status(500).json({ mensaje: 'Categoria obligatoria' });
    }



    try {
        const query = `UPDATE articulos
                        SET
                        id_area= $1,
                        id_categoria= $2,
                            descripcion = $3,
                            activo = $4
                        WHERE id_articulo = $5
                        RETURNING *;
                        `;


        const values = [Number(areaId), Number(categoriaId), descripcion, Number(activo) , Number(id)];

        const result = await pool.query(query, values);

        return res.status(200).json({ mensaje: 'Articulo actualizada con éxito' });


    } catch (error) {
        console.log("🚀 ~ updateArticulo ~ error:", error)
        return res.status(500).json({ mensaje: 'Ocurrio un error al actualizar el artuculo' });

    }


    return res.status(200).json({ mensaje: 'Categoría actualizada con éxito' });

};

// Agregar manejo de errores
const deleteArticulo = async (req, res) => {
    const { id } = req.params;
    const articuloId = Number(id);


    try {
        const query = `UPDATE articulos SET activo = 0  WHERE id_articulo = $1 RETURNING *;`;
        const result = await pool.query(query, [articuloId]);
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