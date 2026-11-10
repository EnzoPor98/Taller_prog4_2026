import RolesRepository from '../repositories/roles.repository.js';
import { responderError } from '../utils/errores.js';

const rolesRepository = new RolesRepository();

// GET /api/roles
const getRoles = async (req, res) => {
    try {
        const roles = await rolesRepository.listarRoles();
        return res.status(200).json(roles);
    } catch (error) {
        return responderError(res, error, 'Ocurrio un error al recuperar los roles');
    }
};

export {
    getRoles
};
