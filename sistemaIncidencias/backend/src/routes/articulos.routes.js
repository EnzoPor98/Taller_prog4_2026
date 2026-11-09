import { Router } from "express";
import { verificarToken } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
//-------------------------------------------------------------------------
import articulosController from "../controllers/articulos.controller.js";
import {
  validarId,
  validarArticulo,
} from "../middleware/articulos.validator.js";

const router = Router();
const controlador = new articulosController();
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
router.get("/", verificarToken, controlador.getArticulos);

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
router.get("/:id", verificarToken, validarId, controlador.getArticulo);
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
router.post(
  "/",
  verificarToken,
  upload.single("archivo"),
  validarArticulo,
  controlador.createArticulo,
);
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
router.patch(
  "/:id",
  verificarToken,
  upload.single("archivo"),
  validarId,
  validarArticulo,
  controlador.updateArticulo,
);
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
router.delete("/:id", verificarToken, validarId, controlador.deleteArticulo);


export default router;
