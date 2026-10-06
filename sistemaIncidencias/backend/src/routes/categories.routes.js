import { Router } from 'express';
import { param, body } from 'express-validator';

import {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/categories.controller.js';
import { verificarToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

// Definicion de endpoints REST para BREAD/CRUD de categorias
router.get('/', verificarToken, getCategories);


router.get('/:id',
    verificarToken,
    [
        param('id')
            .notEmpty().withMessage('ID obligatorio')
            .isInt().withMessage('ID debe ser numérico'),
    ],
    validate,
    getCategory);


router.post('/', verificarToken,
    [
        body('descripcion')
            .notEmpty().withMessage('Descripcion obligatoria')
            .isString().withMessage('Descripcion debe ser texto'),
        body('activo')
            .notEmpty().withMessage('Se debe indicar el estado de la categoria')
    ],
    validate,
    createCategory);


router.put('/:id',
    verificarToken,
    [
        param('id')
            .notEmpty().withMessage('ID obligatorio')
            .isInt().withMessage('ID debe ser numérico'),
        body('descripcion')
            .notEmpty().withMessage('Descripcion obligatoria')
            .isString().withMessage('Descripcion debe ser texto'),
        body('activo')
            .notEmpty().withMessage('Se debe indicar el estado de la categoria')
    ],
    validate,
    updateCategory);


router.delete('/:id',
    verificarToken,
    [
        param('id')
            .notEmpty().withMessage('ID obligatorio')
            .isInt().withMessage('ID debe ser numérico'),
    ],
    validate,
    deleteCategory);

export default router;