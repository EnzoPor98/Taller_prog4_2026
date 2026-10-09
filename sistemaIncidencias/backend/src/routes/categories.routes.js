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

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Listar todas las categorías activas
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 *       401:
 *         description: Token no proporcionado o inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', verificarToken, getCategories);


/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Obtener una categoría por id
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Token no proporcionado o inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id',
    verificarToken,
    [
        param('id')
            .notEmpty().withMessage('ID obligatorio')
            .isInt().withMessage('ID debe ser numérico'),
    ],
    validate,
    getCategory);


/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Crear una nueva categoría
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             descripcion: Hardware
 *             activo: 1
 *     responses:
 *       200:
 *         description: Categoría creada
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno del servidor
 */
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


/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Actualizar una categoría existente
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             descripcion: Hardware
 *             activo: 1
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno del servidor
 */
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


/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Eliminar (baja lógica) una categoría
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoría eliminada
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno del servidor
 */
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