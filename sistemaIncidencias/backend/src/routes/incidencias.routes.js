import { Router } from 'express';
import { verificarToken } from '../middleware/auth.middleware.js';

import {
getIncidencias,
updateIncidencia
} from '../controllers/incidencias.controller.js';

const router = Router();

// Definicion de endpoints REST para incidencias
router.get('/', verificarToken, getIncidencias);
router.patch('/:id', verificarToken, updateIncidencia);


export default router;