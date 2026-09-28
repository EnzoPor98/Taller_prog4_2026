import { Router } from 'express';

import {
    getArticulos,
    getArticulo,
    createArticulo,
    updateArticulo,
    deleteArticulo
} from '../controllers/articulos.controller.js';
import { verificarToken } from '../middleware/auth.middleware.js';

const router = Router();

// Definicion de endpoints REST para BREAD/CRUD de articulos
// Con middleware de token.
router.get('/', verificarToken, getArticulos);
router.get('/:id', verificarToken, getArticulo);
router.post('/', verificarToken, createArticulo);
router.patch('/:id', verificarToken, updateArticulo);
router.delete('/:id', verificarToken, deleteArticulo);

export default router;