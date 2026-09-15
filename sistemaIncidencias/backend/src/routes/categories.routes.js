import { Router } from 'express';

import {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/categories.controller.js';

const router = Router();

// Definicion de endpoints REST para BREAD/CRUD de categorias
router.get('/', getCategories);
router.get('/:id', getCategory);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;