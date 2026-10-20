import { Router } from 'express';

import {
getAreas
} from '../controllers/areas.controller.js';

const router = Router();

/**
 * @swagger
 * /api/areas:
 *   get:
 *     tags: [Areas]
 *     summary: Obtener una lista de areas
 *     description: Recuperar una lista de areas de la base de datos.
 *     responses:
 *       200:
 *         description: Respuesta exitosa con una lista de areas.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/', getAreas);

export default router;