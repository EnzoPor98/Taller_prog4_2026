import IncidenciasService from '../services/incidencias.service.js';
import { responderError } from '../utils/errores.js';
import { ESTADOS } from '../utils/estados.js';

export default class IncidenciasController {
    constructor() {
        this.incidencias = new IncidenciasService();
    }

    getIncidencias = async (req, res) => {
        try {
            const incidencias = await this.incidencias.getIncidencias(req.usuario.id);
            return res.status(200).json(incidencias);
        } catch (error) {
            console.log("🚀 ~ getIncidencias ~ error:", error)
            return res.status(500).json({ mensaje: 'Ocurrio un error al recuperar las incicencias' });
        }
    };

    getIncidencia = async (req, res) => {
        const { id } = req.params;

        try {
            if (!id) {
                return res.status(500).json({ mensaje: 'Se requiere el id de la categoria' });
            }

            const incidencia = await this.incidencias.getIncidencia(id);
            return res.status(200).json(incidencia.length == 1 ? incidencia[0] : incidencia);
        } catch (error) {
            console.log("🚀 ~ getIncidencia ~ error:", error)
            return res.status(500).json({ mensaje: 'Ocurrio un error al recuperar la categoria' });
        }
    };

    updateIncidencia = async (req, res) => {
        const {
            finalizada,
            descripcion_resolucion,
            id_estado
        } = req.body;

        const id_incidencia = Number(req.params.id);

        try {
            // "finalizada: true" es la forma que usa el frontend para cerrar una incidencia.
            const status = finalizada ? ESTADOS.RESUELTA : Number(id_estado);

            // El servicio actualiza la incidencia, registra el historial, avisa por socket
            // y, si se finalizo, le manda un mail al creador (sin que un fallo del mail rompa la operacion).
            const { incidencia, notificado } = await this.incidencias.actualizarIncidencia(
                id_incidencia,
                { id_estado: status, descripcion_resolucion },
                req.usuario
            );

            return res.status(200).json({
                mensaje: 'Incidencia actualizada con éxito',
                incidencia,
                notificado
            });
        } catch (error) {
            console.log("Ocurrio un error al actualizar la incidencia", error)
            return responderError(res, error, 'Ocurrio un error al actualizar la incidencia');
        }
    };

    createIncidencia = async (req, res) => {
        try {
            const rows = await this.incidencias.createIncidencia(req.body, req.usuario);
            res.status(200).json({ incidencias: rows });
        } catch (error) {
            console.log(`Paso algo -> ${error}`);
            res.status(500).json({ error: "Error interno." });
        }
    };

    // PUT /api/incidencias/:id/asignar  (Director)
    asignarIncidencia = async (req, res) => {
        try {
            const incidencia = await this.incidencias.asignarIncidencia(
                Number(req.params.id),
                Number(req.body.asignado_a)
            );
            return res.status(200).json({ mensaje: 'Incidencia asignada con éxito', incidencia });
        } catch (error) {
            return responderError(res, error, 'Ocurrio un error al asignar la incidencia');
        }
    };

    // PUT /api/incidencias/:id/cancelar  (Director o Empleado municipal creador)
    cancelarIncidencia = async (req, res) => {
        try {
            const { incidencia, notificado } = await this.incidencias.cancelarIncidencia(
                Number(req.params.id),
                req.usuario
            );
            return res.status(200).json({ mensaje: 'Incidencia cancelada con éxito', incidencia, notificado });
        } catch (error) {
            return responderError(res, error, 'Ocurrio un error al cancelar la incidencia');
        }
    };

    // GET /api/incidencias/datos-dashboard?desde=YYYY-MM-DD&hasta=YYYY-MM-DD  (Director)
    getDatosDashboard = async (req, res) => {
        try {
            const { desde, hasta } = req.query;
            const datos = await this.incidencias.obtenerDatosDashboard({ desde, hasta });
            return res.status(200).json(datos);
        } catch (error) {
            return responderError(res, error, 'Ocurrio un error al obtener los datos del dashboard');
        }
    };

    // GET /api/incidencias/informe?desde=&hasta=&estado=  (Director) -> PDF
    getInforme = async (req, res) => {
        try {
            const { desde, hasta, estado } = req.query;
            const { pdf, nombreArchivo } = await this.incidencias.generarInforme({
                desde,
                hasta,
                estado: estado ? Number(estado) : undefined,
                idUsuario: req.usuario.id
            });

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
                'Content-Length': pdf.length,
                // Permite que el frontend (otro origen) lea el nombre del archivo
                'Access-Control-Expose-Headers': 'Content-Disposition'
            });
            return res.status(200).end(pdf);
        } catch (error) {
            return responderError(res, error, 'Ocurrio un error al generar el informe');
        }
    };
}
