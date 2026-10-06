import {
    categorias,
    generarCodigo5Digitos
} from '../utils/example-data.js'

import pool from '../../config/db.js';

const toBit = (value) => {
    if (value === true || value === 'true' || value === 1 || value === '1') return 1;
    if (value === false || value === 'false' || value === 0 || value === '0') return 0;
    return value;
};

const getCategories = async (req, res) => {
    // ejemplo de respuesta a un get
    try {
        const query = `SELECT * FROM categorias where activo=1;`;
        const result = await pool.query(query);
        const categorias = result.rows;
        return res.status(200).json(categorias);
    } catch (error) {
        return res.status(500).json({ mensaje: 'Ocurrio un error en la creacion de la categoria' });
    }

};


// Dentro de cada metodo usar la logica de manejo de datos necesaria
const getCategory = async (req, res) => {
    //Agregar manejo de errores
    const { id } = req.params; //Solo para ejemplo lo que recibimos en el id es el index desde el front

    try {
        const query = `
        SELECT * FROM categorias where id_categoria=$1;
        `;
        const result = await pool.query(query, [id]);
        const categorias = result.rows;
        return res.status(200).json(categorias);
    } catch (error) {
        console.log("🚀 ~ createCategory ~ error:", error)
        return res.status(500).json({ mensaje: 'Ocurrio un error al recuperar la categoria' });
    }

};

const createCategory = async (req, res) => {
    const { descripcion, activo } = req.body;

    try {
        const query = `
        INSERT INTO categorias (descripcion, activo)
        VALUES ($1, $2)
        RETURNING *;
        `;
        const values = [descripcion, toBit(activo)];
        const result = await pool.query(query, values);

        return res.status(200).json({ mensaje: 'Categoría creada con éxito', categoria: result.rows[0] });
    } catch (error) {
        console.log("🚀 ~ createCategory ~ error:", error)
        return res.status(500).json({ mensaje: 'Ocurrio un error en la creacion de la categoria' });
    }


};

const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { descripcion, activo } = req.body;

    try {
        const query = `
        UPDATE categorias
        SET
          descripcion = $1,
          activo = $2
        WHERE id_categoria = $3
        RETURNING *;
        `;
        const values = [
            descripcion,
            toBit(activo),
            id
        ]
        const result = await pool.query(query, values);

        return res.status(200).json({ mensaje: 'Categoría actualizada con éxito' });
    } catch (error) {
        console.log("🚀 ~ updateCategory ~ error:", error)
        return res.status(500).json({ mensaje: 'Ocurrio un error al actualizar la categoria' });
    }
};

// Agregar manejo de errores
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    const categoriaId = Number(id);


    try {
        const query = `UPDATE categorias SET activo = 0  WHERE id_categoria = $1 RETURNING *;`;
        const result = await pool.query(query, [categoriaId]);
        return res.status(200).json({ mensaje: 'Categoría eliminada con éxito' });


    } catch (error) {
        console.log("🚀 ~ deleteCategory ~ error:", error)
        return res.status(500).json({ mensaje: 'Ocurrio un error al eliminar la categoria' });

    }



};

export {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
};