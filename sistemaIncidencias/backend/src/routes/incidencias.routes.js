import { Router } from 'express';
import { param, body } from 'express-validator';
import { verificarToken, autorizarUsuarios } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { ROLES } from '../utils/roles.js';

import {
getIncidencias,
getIncidencia,
updateIncidencia,
createIncidencia,
asignarIncidencia,
cancelarIncidencia
} from '../controllers/incidencias.controller.js';

const router = Router();

const validarIdIncidencia = param('id')
    .isInt({ min: 1 }).withMessage('El id de la incidencia debe ser un entero positivo');

// Definicion de endpoints REST para incidencias
router.get('/', verificarToken, getIncidencias);
router.get('/:id', verificarToken, getIncidencia);
router.patch('/:id', verificarToken, updateIncidencia);
router.post('/', verificarToken, createIncidencia);
//Definir el delete de momento cerrar o finalizar actualizan estados pero no se "borran incidencias" de la base de datos

/**
 * @swagger
 * /api/incidencias/{id}/asignar:
 *   put:
 *     summary: Asignar una incidencia a un empleado del área de sistemas
 *     description: Solo el Director. La incidencia debe estar Pendiente o En Proceso y pasa a En Proceso. Registra el cambio en el historial.
 *     tags: [Incidencias]
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
 *             asignado_a: 2
 *     responses:
 *       200:
 *         description: Incidencia asignada
 *       400:
 *         description: Datos inválidos o el usuario no es un empleado de sistemas activo
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Token inválido o el usuario no es Director
 *       404:
 *         description: Incidencia no encontrada
 *       409:
 *         description: La incidencia está Resuelta o Cancelada
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id/asignar',
    verificarToken,
    autorizarUsuarios([ROLES.DIRECTOR]),
    [
        validarIdIncidencia,
        body('asignado_a')
            .notEmpty().withMessage('El empleado a asignar es obligatorio')
            .isInt({ min: 1 }).withMessage('El empleado a asignar debe ser un entero positivo'),
    ],
    validate,
    asignarIncidencia);

/**
 * @swagger
 * /api/incidencias/{id}/cancelar:
 *   put:
 *     summary: Cancelar una incidencia pendiente
 *     description: El Director puede cancelar cualquier incidencia pendiente; el Empleado municipal solo las que creó. Registra el cambio en el historial y envía un mail al creador.
 *     tags: [Incidencias]
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
 *         description: Incidencia cancelada (notificado indica si se pudo enviar el mail)
 *       400:
 *         description: Id inválido
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Sin permisos para cancelar esta incidencia
 *       404:
 *         description: Incidencia no encontrada
 *       409:
 *         description: La incidencia no está Pendiente
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id/cancelar',
    verificarToken,
    autorizarUsuarios([ROLES.DIRECTOR, ROLES.MUNICIPAL]),
    [validarIdIncidencia],
    validate,
    cancelarIncidencia);


export default router;
