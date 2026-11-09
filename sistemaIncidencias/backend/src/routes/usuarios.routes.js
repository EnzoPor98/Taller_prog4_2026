import { Router } from 'express';
import { query } from 'express-validator';
import { verificarToken, autorizarUsuarios } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { ROLES } from '../utils/roles.js';
import { getUsuarios } from '../controllers/usuarios.controller.js';

const router = Router();

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Listar usuarios activos (opcionalmente filtrados por rol)
 *     description: Solo el Director. Se usa para elegir a qué empleado de sistemas (rol=3) asignar una incidencia. No devuelve contraseñas.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: rol
 *         required: false
 *         description: 1 = Director, 2 = Empleado municipal, 3 = Empleado de sistemas
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       400:
 *         description: Rol inválido
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Token inválido o el usuario no es Director
 *       500:
 *         description: Error interno del servidor
 */
router.get('/',
    verificarToken,
    autorizarUsuarios([ROLES.DIRECTOR]),
    [
        query('rol')
            .optional()
            .isInt({ min: 1, max: 3 }).withMessage('El rol debe ser 1, 2 o 3'),
    ],
    validate,
    getUsuarios);

export default router;
