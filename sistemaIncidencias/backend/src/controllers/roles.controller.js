import * as rolesData from '../data/roles.data.js';
import { responderError } from '../utils/errores.js';

// GET /api/roles
const getRoles = async (req, res) => {
    try {
        const roles = await rolesData.listarRoles();
        return res.status(200).json(roles);
    } catch (error) {
        return responderError(res, error, 'Ocurrio un error al recuperar los roles');
    }
};

export {
    getRoles
};
