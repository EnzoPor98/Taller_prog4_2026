import {
    categorias,
    generarCodigo5Digitos
} from '../utils/example-data.js'

<<<<<<< HEAD
const getCategories = async (req, res) => {
    // ejemplo de respuesta a un get
    return res.status(200).json(categorias);
=======
import pool from '../../config/db.js';

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

>>>>>>> origin/main
};


// Dentro de cada metodo usar la logica de manejo de datos necesaria
const getCategory = async (req, res) => {
    //Agregar manejo de errores 
    const { id } = req.params; //Solo para ejemplo lo que recibimos en el id es el index desde el front
<<<<<<< HEAD
    return res.status(200).json(categorias[id]);
=======

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
        console.log("🚀 ~ createCategory ~ error:", error)
        return res.status(500).json({ mensaje: 'Ocurrio un error al recuperar la categoria' });
    }
>>>>>>> origin/main

};

const createCategory = async (req, res) => {
    const {
        descripcion, activo
    } = req.body;
    if (!descripcion) {
        return res.status(500).json({ mensaje: 'Descripcion obligatoria' });
    }
    if (!activo) {
        return res.status(500).json({ mensaje: 'Se debe indicar el estado de la categoria' });
    }
<<<<<<< HEAD
    if (activo && descripcion) {
        categorias.push({
            id: generarCodigo5Digitos(),
            descripcion: descripcion.trim(),
            activo
        })
    }
    return res.status(200).json({ mensaje: 'Categoría creada con éxito' });
=======


    try {
        const query = `
        INSERT INTO categorias (descripcion, activo)
        VALUES ($1, $2)
        RETURNING *;
        `;
        const values = [descripcion, Number(activo)];
        const result = await pool.query(query, values);

        return res.status(200).json({ mensaje: 'Categoría creada con éxito' });
    } catch (error) {
        console.log("🚀 ~ createCategory ~ error:", error)
        return res.status(500).json({ mensaje: 'Ocurrio un error en la creacion de la categoria' });
    }

>>>>>>> origin/main

};

const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { descripcion, activo } = req.body;


    if (!descripcion) {
        return res.status(500).json({ mensaje: 'Descripcion obligatoria' });
    }
    if (!activo) {
        return res.status(500).json({ mensaje: 'Se debe indicar el estado de la categoria' });
    }

<<<<<<< HEAD
    Object.assign(categorias[id], {
        descripcion: descripcion,
        activo: activo
    });
=======

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
            Number(activo),
            id
        ]
        const result = await pool.query(query, values);

        return res.status(200).json({ mensaje: 'Categoría actualizada con éxito' });


    } catch (error) {
        console.log("🚀 ~ deleteCategory ~ error:", error)
        return res.status(500).json({ mensaje: 'Ocurrio un error al actualizar la categoria' });

    }


>>>>>>> origin/main
    return res.status(200).json({ mensaje: 'Categoría actualizada con éxito' });

};

// Agregar manejo de errores
const deleteCategory = async (req, res) => {
<<<<<<< HEAD

    const { id } = req.params;
    const indice = Number(id);

    categorias.splice(indice, 1);

    return res.status(200).json({ mensaje: 'Categoría eliminada con éxito' });
=======
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


>>>>>>> origin/main

};

export {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
};