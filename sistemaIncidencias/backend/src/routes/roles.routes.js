import { Router } from 'express';
import { verificarToken } from '../middleware/auth.middleware.js';
import { getRoles } from '../controllers/roles.controller.js';

const router = Router();

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Listar los roles disponibles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles (id_rol, nombre, descripcion)
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', verificarToken, getRoles);

export default router;
