import { Router } from 'express';
import { param, body } from 'express-validator';

import {
    getArticulos,
    getArticulo,
    createArticulo,
    updateArticulo,
    deleteArticulo
} from '../controllers/articulos.controller.js';
import { verificarToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/articulos:
 *   get:
 *     summary: Listar todos los artículos activos
 *     tags: [Articulos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de artículos con joins a área y categoría
 *       401:
 *         description: Token no proporcionado o inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', verificarToken, getArticulos);

/**
 * @swagger
 * /api/articulos/{id}:
 *   get:
 *     summary: Obtener un artículo por id
 *     tags: [Articulos]
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
 *         description: Artículo encontrado
 *       401:
 *         description: Token no proporcionado o inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', verificarToken,
    [
        param('id')
            .notEmpty().withMessage('ID obligatorio')
            .isInt().withMessage('ID debe ser numérico'),
    ],
    validate,
    getArticulo);

/**
 * @swagger
 * /api/articulos:
 *   post:
 *     summary: Crear un nuevo artículo
 *     tags: [Articulos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             areaId: 1
 *             categoriaId: 2
 *             descripcion: Notebook Dell Latitude
 *             activo: 1
 *     responses:
 *       200:
 *         description: Artículo creado
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Token no proporcionado o inválido
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', verificarToken,
    [
        body('areaId')
            .notEmpty().withMessage('Area obligatoria')
            .isInt().withMessage('Area debe ser numérica'),
        body('categoriaId')
            .notEmpty().withMessage('Categoria obligatoria')
            .isInt().withMessage('Categoria debe ser numérica'),
        body('descripcion')
            .notEmpty().withMessage('Descripcion obligatoria')
            .isString().withMessage('Descripcion debe ser texto'),
    ],
    validate,
    createArticulo);

/**
 * @swagger
 * /api/articulos/{id}:
 *   patch:
 *     summary: Actualizar un artículo existente
 *     tags: [Articulos]
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
 *             areaId: 1
 *             categoriaId: 2
 *             descripcion: Notebook Dell Latitude
 *             activo: 1
 *     responses:
 *       200:
 *         description: Artículo actualizado
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Token no proporcionado o inválido
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:id', verificarToken,
    [
        param('id')
            .notEmpty().withMessage('ID obligatorio')
            .isInt().withMessage('ID debe ser numérico'),
        body('areaId')
            .notEmpty().withMessage('Area obligatoria')
            .isInt().withMessage('Area debe ser numérica'),
        body('categoriaId')
            .notEmpty().withMessage('Categoria obligatoria')
            .isInt().withMessage('Categoria debe ser numérica'),
        body('descripcion')
            .notEmpty().withMessage('Descripcion obligatoria')
            .isString().withMessage('Descripcion debe ser texto'),
    ],
    validate,
    updateArticulo);

/**
 * @swagger
 * /api/articulos/{id}:
 *   delete:
 *     summary: Eliminar (baja lógica) un artículo
 *     tags: [Articulos]
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
 *         description: Artículo eliminado
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Token no proporcionado o inválido
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', verificarToken,
    [
        param('id')
            .notEmpty().withMessage('ID obligatorio')
            .isInt().withMessage('ID debe ser numérico'),
    ],
    validate,
    deleteArticulo);

export default router;