import {
    categorias,
    generarCodigo5Digitos
} from '../utils/example-data.js'

const getCategories = async (req, res) => {
    // ejemplo de respuesta a un get
    return res.status(200).json(categorias);
};


// Dentro de cada metodo usar la logica de manejo de datos necesaria
const getCategory = async (req, res) => {
    //Agregar manejo de errores 
    const { id } = req.params; //Solo para ejemplo lo que recibimos en el id es el index desde el front
    return res.status(200).json(categorias[id]);

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
    if (activo && descripcion) {
        categorias.push({
            id: generarCodigo5Digitos(),
            descripcion: descripcion.trim(),
            activo
        })
    }
    return res.status(200).json({ mensaje: 'Categoría creada con éxito' });

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

    Object.assign(categorias[id], {
        descripcion: descripcion,
        activo: activo
    });
    return res.status(200).json({ mensaje: 'Categoría actualizada con éxito' });

};

// Agregar manejo de errores
const deleteCategory = async (req, res) => {

    const { id } = req.params;
    const indice = Number(id);

    categorias.splice(indice, 1);

    return res.status(200).json({ mensaje: 'Categoría eliminada con éxito' });

};

export {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
};