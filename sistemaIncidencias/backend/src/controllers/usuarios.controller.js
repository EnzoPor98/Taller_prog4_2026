import * as usuariosData from '../data/usuarios.data.js';
import { responderError } from '../utils/errores.js';

// GET /api/usuarios?rol=3  (Director)
const getUsuarios = async (req, res) => {
    try {
        const rol = req.query.rol ? Number(req.query.rol) : undefined;
        const usuarios = await usuariosData.listarActivos({ rol });
        return res.status(200).json(usuarios);
    } catch (error) {
        return responderError(res, error, 'Ocurrio un error al recuperar los usuarios');
    }
};

export {
    getUsuarios
};
