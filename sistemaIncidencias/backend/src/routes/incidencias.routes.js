import { Router } from 'express';

import {
getIncidencias
} from '../controllers/incidencias.controller.js';

const router = Router();

// Definicion de endpoints REST para incidencias
router.get('/', getIncidencias);

export default router;