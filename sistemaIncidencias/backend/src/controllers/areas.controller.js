import AreasService from '../services/areas.service.js';

const areasService = new AreasService();

export const getAreas = async (req, res) => {
    try {
        const areas = await areasService.getAreas();
        return res.status(200).json(areas);
    } catch (error) {
        console.error('Error al obtener las areas:', error);
        return res.status(500).json({ mensaje: 'Ocurrio un error al recuperar las areas' });
    }
};
