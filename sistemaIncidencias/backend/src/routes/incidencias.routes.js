import { Router } from 'express';
import { verificarToken } from '../middleware/auth.middleware.js';

import {
getIncidencias,
getIncidencia,
updateIncidencia,
createIncidencia
} from '../controllers/incidencias.controller.js';

const router = Router();

// Definicion de endpoints REST para incidencias
router.get('/', verificarToken, getIncidencias);
router.get('/:id', verificarToken, getIncidencia);
router.patch('/:id', verificarToken, updateIncidencia);
router.post('/', verificarToken, createIncidencia);
//Definir el delete de momento cerrar o finalizar actualizan estados pero no se "borran incidencias" de la base de datos


export default router;