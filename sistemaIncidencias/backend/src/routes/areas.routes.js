import { Router } from 'express';

import {
getAreas
} from '../controllers/areas.controller.js';

const router = Router();

// Definicion de endpoints REST para BREAD/CRUD de articulos
router.get('/', getAreas);

export default router;