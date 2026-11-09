import CategoriasService from '../services/categorias.service.js';

const categoriasService = new CategoriasService();

const getCategorias = async (req, res) => {
    try {
        const categorias = await categoriasService.getCategorias();
        return res.status(200).json(categorias);
    } catch (error) {
        console.error('Error al obtener las categorias:', error);
        return res.status(500).json({ mensaje: 'Ocurrio un error al recuperar las categorias' });
    }
};

const getCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const categorias = await categoriasService.getCategoria(id);
        return res.status(200).json(categorias);
    } catch (error) {
        console.error('Error al obtener la categoria:', error);
        return res.status(500).json({ mensaje: 'Ocurrio un error al recuperar la categoria' });
    }
};

const createCategoria = async (req, res) => {
    try {
        const { descripcion, activo } = req.body;
        const categoria = await categoriasService.createCategoria({ descripcion, activo });
        return res.status(200).json({ mensaje: 'Categoría creada con éxito', categoria });
    } catch (error) {
        console.error('Error al crear la categoria:', error);
        return res.status(500).json({ mensaje: 'Ocurrio un error en la creacion de la categoria' });
    }
};

const updateCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { descripcion, activo } = req.body;
        await categoriasService.updateCategoria({ id, descripcion, activo });
        return res.status(200).json({ mensaje: 'Categoría actualizada con éxito' });
    } catch (error) {
        console.error('Error al actualizar la categoria:', error);
        return res.status(500).json({ mensaje: 'Ocurrio un error al actualizar la categoria' });
    }
};

const deleteCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        await categoriasService.deleteCategoria(id);
        return res.status(200).json({ mensaje: 'Categoría eliminada con éxito' });
    } catch (error) {
        console.error('Error al eliminar la categoria:', error);
        return res.status(500).json({ mensaje: 'Ocurrio un error al eliminar la categoria' });
    }
};

export {
    getCategorias,
    getCategoria,
    createCategoria,
    updateCategoria,
    deleteCategoria
};
