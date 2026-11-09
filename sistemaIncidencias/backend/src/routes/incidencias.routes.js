import { Router } from 'express';
import { param, body, query } from 'express-validator';
import { verificarToken, autorizarUsuarios } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { ROLES } from '../utils/roles.js';

import {
getIncidencias,
getIncidencia,
updateIncidencia,
createIncidencia,
asignarIncidencia,
cancelarIncidencia,
getDatosDashboard,
getInforme
} from '../controllers/incidencias.controller.js';

const router = Router();

const validarIdIncidencia = param('id')
    .isInt({ min: 1 }).withMessage('El id de la incidencia debe ser un entero positivo');

const validarFecha = (campo) => query(campo)
    .optional()
    .isISO8601({ strict: true }).withMessage(`"${campo}" debe ser una fecha con formato YYYY-MM-DD`)
    .isLength({ min: 10, max: 10 }).withMessage(`"${campo}" debe ser una fecha con formato YYYY-MM-DD`);

/**
 * @swagger
 * /api/incidencias/datos-dashboard:
 *   get:
 *     summary: Datos para el panel del Director
 *     description: >
 *       Solo el Director. Devuelve los totales por estado, la cantidad de incidencias creadas por día
 *       en el rango indicado (por defecto los últimos 30 días) y las incidencias de prioridad Alta
 *       que siguen Pendientes o En Proceso.
 *     tags: [Incidencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: desde
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: '2026-11-01'
 *       - in: query
 *         name: hasta
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: '2026-11-30'
 *     responses:
 *       200:
 *         description: Datos del dashboard
 *         content:
 *           application/json:
 *             example:
 *               total: 2
 *               porEstado:
 *                 - { id_estado: 1, estado: Pendiente, total: 0 }
 *                 - { id_estado: 2, estado: En Proceso, total: 1 }
 *               porFecha:
 *                 desde: '2026-11-01'
 *                 hasta: '2026-11-02'
 *                 datos:
 *                   - { fecha: '2026-11-01', total: 0 }
 *                   - { fecha: '2026-11-02', total: 2 }
 *               prioritarias:
 *                 total: 1
 *                 items:
 *                   - { id_incidencia: 1, articulo: Mouse sin pilas, estado: En Proceso, asignado_a: Nahuel Montenegro }
 *       400:
 *         description: Fechas inválidas o rango mayor a 366 días
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Token inválido o el usuario no es Director
 *       500:
 *         description: Error interno del servidor
 */
// Va antes de '/:id' para que Express no interprete "datos-dashboard" como un id
router.get('/datos-dashboard',
    verificarToken,
    autorizarUsuarios([ROLES.DIRECTOR]),
    [validarFecha('desde'), validarFecha('hasta')],
    validate,
    getDatosDashboard);

/**
 * @swagger
 * /api/incidencias/informe:
 *   get:
 *     summary: Reporte estadístico de incidencias en PDF
 *     description: >
 *       Solo el Director. Genera un PDF (plantilla Handlebars + Puppeteer) con el resumen por estado
 *       y por prioridad y el detalle de las incidencias. Todos los filtros son opcionales.
 *     tags: [Incidencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: desde
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: hasta
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: estado
 *         required: false
 *         description: 1 = Pendiente, 2 = En Proceso, 3 = Resuelta, 4 = Cancelada
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3, 4]
 *     responses:
 *       200:
 *         description: Archivo PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Filtros inválidos
 *       401:
 *         description: Token no proporcionado
 *       403:
 *         description: Token inválido o el usuario no es Director
 *       500:
 *         description: Error interno del servidor
 */
// Tambien va antes de '/:id'
router.get('/informe',
    verificarToken,
    autorizarUsuarios([ROLES.DIRECTOR]),
    [
        validarFecha('desde'),
        validarFecha('hasta'),
        query('estado')
            .optional()
            .isInt({ min: 1, max: 4 }).withMessage('El estado debe ser 1, 2, 3 o 4'),
    ],
    validate,
    getInforme);

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
