import pool from '../../config/db.js';
import IncidenciasRepository from '../repositories/incidencias.repository.js';
import UsuariosRepository from '../repositories/usuarios.repository.js';
import { enviarMail } from './mail.service.js';
import { ErrorHttp } from '../utils/errores.js';
import { ROLES } from '../utils/roles.js';
import { ESTADOS, NOMBRE_ESTADO } from '../utils/estados.js';
import { NOMBRE_PRIORIDAD } from '../utils/prioridades.js';
import {
    ZONA_HORARIA,
    hoyEnZona,
    sumarDias,
    diasEntre,
    formatearFechaCorta,
    formatearFechaHora
} from '../utils/fechas.js';
import { generarPdf } from './reportes.service.js';
import { EVENTOS, SALAS_TODAS, emitirEventoEnSalas, emitirEventoAUsuario } from '../socket/socket.js';

const DIAS_POR_DEFECTO = 30;
const MAX_DIAS_RANGO = 366;
const PRIORIDAD_ALTA = 1;
const LIMITE_PRIORITARIAS = 10;

const porcentaje = (parte, total) => (total === 0 ? 0 : Math.round((parte / total) * 100));

// Cuenta cuantas incidencias hay de cada valor (incluye los valores con 0)
const contarPor = (filas, campo, nombres) => Object.entries(nombres).map(([id, nombre]) => {
    const total = filas.filter((fila) => fila[campo] === Number(id)).length;
    return { id: Number(id), nombre, total, porcentaje: porcentaje(total, filas.length) };
});

// Capa de servicio: reglas de negocio y manejo de transacciones.

// Ejecuta "operacion" dentro de BEGIN/COMMIT y hace ROLLBACK si algo falla
const enTransaccion = async (operacion) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const resultado = await operacion(client);
        await client.query('COMMIT');
        return resultado;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export default class IncidenciasService {
    constructor() {
        this.incidencias = new IncidenciasRepository();
        this.usuarios = new UsuariosRepository();
    }

    getIncidencias = async (idUsuario) => {
        const rol = await this.incidencias.obtenerRol(idUsuario);
        return this.incidencias.getIncidencias(rol, idUsuario);
    };

    getIncidencia = (id) => this.incidencias.getIncidencia(id);

    createIncidencia = async (incidencia, usuario) => {
        // El alta y el primer registro del historial van en la misma transaccion
        const rows = await enTransaccion(async (client) => {
            const creada = await this.incidencias.createIncidencia(client, incidencia);
            await this.incidencias.registrarHistorial(client, creada[0].id_incidencia, creada[0].id_estado);
            return creada;
        });

        // Se avisa en tiempo real para que el Director actualice sus graficos
        emitirEventoEnSalas(EVENTOS.INCIDENCIA_CREADA, {
            id_incidencia: rows[0]?.id_incidencia ?? null,
            id_estado: incidencia.id_estado ?? null,
            prioridad: incidencia.prioridad ?? null,
            creado_por: incidencia.creado_por ?? usuario?.id ?? null
        }, SALAS_TODAS);

        return rows;
    };

    // Asigna la incidencia a un empleado de sistemas y la pasa a "En Proceso".
    // Se permite reasignar mientras siga en proceso.
    asignarIncidencia = async (idIncidencia, idEmpleado) => {
        const actualizada = await enTransaccion(async (client) => {
            const incidencia = await this.incidencias.obtenerParaActualizar(client, idIncidencia);
            if (!incidencia) {
                throw new ErrorHttp(404, 'Incidencia no encontrada');
            }

            const asignable = [ESTADOS.PENDIENTE, ESTADOS.EN_PROCESO].includes(incidencia.id_estado);
            if (!asignable) {
                throw new ErrorHttp(409, 'Solo se pueden asignar incidencias pendientes o en proceso');
            }

            const empleado = await this.usuarios.obtenerActivoPorId(idEmpleado, client);
            if (!empleado || empleado.rol !== ROLES.SISTEMAS) {
                throw new ErrorHttp(400, 'El usuario indicado no es un empleado activo del área de sistemas');
            }

            const modificada = await this.incidencias.actualizarAsignacion(
                client, idIncidencia, idEmpleado, ESTADOS.EN_PROCESO
            );

            // Solo se registra en el historial si el estado cambio
            if (incidencia.id_estado !== ESTADOS.EN_PROCESO) {
                await this.incidencias.registrarHistorial(client, idIncidencia, ESTADOS.EN_PROCESO);
            }

            return modificada;
        });

        // Se avisa en tiempo real (fuera de la transaccion) para que el Director actualice sus graficos
        emitirEventoEnSalas(EVENTOS.INCIDENCIA_ASIGNADA, {
            id_incidencia: idIncidencia,
            id_estado: ESTADOS.EN_PROCESO,
            estado: NOMBRE_ESTADO[ESTADOS.EN_PROCESO],
            asignado_a: actualizada?.asignado_a ?? null
        }, SALAS_TODAS);

        // Ademas se avisa SOLO al empleado de sistemas que recibio la asignacion:
        // su pantalla muestra un modal y recarga la tabla con la nueva incidencia.
        const datosAsignacion = await this.incidencias.obtenerDatosAsignacion(idIncidencia);
        emitirEventoAUsuario(EVENTOS.INCIDENCIA_RECIBIDA, {
            id_incidencia: idIncidencia,
            id_estado: ESTADOS.EN_PROCESO,
            estado: NOMBRE_ESTADO[ESTADOS.EN_PROCESO],
            prioridad: datosAsignacion?.prioridad ?? null,
            descripcion_pedido: datosAsignacion?.descripcion_pedido ?? null,
            articulo: datosAsignacion?.articulo ?? null,
            area: datosAsignacion?.area ?? null,
            creado: datosAsignacion?.creado ?? null,
            creador: datosAsignacion?.nombre_creador
                ? `${datosAsignacion.nombre_creador} ${datosAsignacion.apellido_creador ?? ''}`.trim()
                : null
        }, actualizada?.asignado_a);

        return actualizada;
    };

    // Cancela una incidencia pendiente.
    // El director puede cancelar cualquiera; el empleado municipal solo las propias.
    cancelarIncidencia = async (idIncidencia, usuario) => {
        const cancelada = await enTransaccion(async (client) => {
            const incidencia = await this.incidencias.obtenerParaActualizar(client, idIncidencia);
            if (!incidencia) {
                throw new ErrorHttp(404, 'Incidencia no encontrada');
            }

            if (usuario.rol === ROLES.MUNICIPAL && incidencia.creado_por !== usuario.id) {
                throw new ErrorHttp(403, 'Solo podés cancelar incidencias creadas por vos');
            }

            if (incidencia.id_estado !== ESTADOS.PENDIENTE) {
                throw new ErrorHttp(409, 'Solo se pueden cancelar incidencias pendientes');
            }

            const actualizada = await this.incidencias.actualizarEstado(client, idIncidencia, ESTADOS.CANCELADA);
            await this.incidencias.registrarHistorial(client, idIncidencia, ESTADOS.CANCELADA);
            return actualizada;
        });

        // El mail se envia fuera de la transaccion: si falla, la cancelacion ya quedo guardada
        const notificado = await this.notificarCancelacion(idIncidencia, usuario.id);

        // Se avisa en tiempo real para que el Director actualice sus graficos
        emitirEventoEnSalas(EVENTOS.INCIDENCIA_CANCELADA, {
            id_incidencia: idIncidencia,
            id_estado: ESTADOS.CANCELADA,
            estado: NOMBRE_ESTADO[ESTADOS.CANCELADA],
            cancelada_por: usuario.id
        }, SALAS_TODAS);

        return { incidencia: cancelada, notificado };
    };

    // Actualiza el estado de una incidencia (finalizarla o cambiar su estado) y notifica por socket.
    // Se usa cuando el empleado de sistemas cierra una incidencia o el director la actualiza.
    actualizarIncidencia = async (idIncidencia, { id_estado, descripcion_resolucion }, usuario) => {
        if (!id_estado) {
            throw new ErrorHttp(400, 'El estado de la incidencia es obligatorio');
        }

        const actualizada = await enTransaccion(async (client) => {
            const incidencia = await this.incidencias.obtenerParaActualizar(client, idIncidencia);
            if (!incidencia) {
                throw new ErrorHttp(404, 'Incidencia no encontrada');
            }

            const modificada = await this.incidencias.actualizarEstadoYResolucion(
                client, idIncidencia, id_estado, descripcion_resolucion ?? null
            );

            // El historial se registra solo si el estado cambio
            if (incidencia.id_estado !== id_estado) {
                await this.incidencias.registrarHistorial(client, idIncidencia, id_estado);
            }

            return modificada;
        });

        const finalizada = id_estado === ESTADOS.RESUELTA;

        // Se avisa en tiempo real para que el Director actualice sus graficos
        emitirEventoEnSalas(
            finalizada ? EVENTOS.INCIDENCIA_FINALIZADA : EVENTOS.INCIDENCIA_ACTUALIZADA,
            {
                id_incidencia: idIncidencia,
                id_estado: id_estado,
                estado: NOMBRE_ESTADO[id_estado] ?? null,
                descripcion_resolucion: descripcion_resolucion ?? null,
                actualizado_por: usuario?.id ?? null
            },
            SALAS_TODAS
        );

        // El mail va al creador de la incidencia y se envia fuera de la transaccion:
        // si falla, la actualizacion ya quedo guardada y no se propaga el error.
        const notificado = finalizada
            ? await this.notificarFinalizacion(idIncidencia, usuario?.id)
            : false;

        return { incidencia: actualizada, notificado };
    };

    notificarFinalizacion = async (idIncidencia, idUsuarioQueFinaliza) => {
        try {
            const datos = await this.incidencias.obtenerDatosNotificacion(idIncidencia);
            const quienFinaliza = idUsuarioQueFinaliza
                ? await this.usuarios.obtenerActivoPorId(idUsuarioQueFinaliza)
                : null;

            await enviarMail({
                to: datos.email_creador,
                subject: `Incidencia #${idIncidencia} finalizada`,
                template: 'incidencia-finalizada',
                data: {
                    nombre: datos.nombre_creador,
                    id: datos.id_incidencia,
                    articulo: datos.articulo,
                    descripcion: datos.descripcion_pedido,
                    area: datos.area,
                    finalizadoPor: quienFinaliza
                        ? `${quienFinaliza.nombres} ${quienFinaliza.apellidos}`
                        : 'Sistema'
                }
            });
            return true;
        } catch (error) {
            console.error(`No se pudo enviar el mail de finalizacion de la incidencia #${idIncidencia}:`, error.message);
            return false;
        }
    };

    notificarCancelacion = async (idIncidencia, idUsuarioQueCancela) => {
        try {
            const datos = await this.incidencias.obtenerDatosNotificacion(idIncidencia);
            const quienCancela = await this.usuarios.obtenerActivoPorId(idUsuarioQueCancela);

            await enviarMail({
                to: datos.email_creador,
                subject: `Incidencia #${idIncidencia} cancelada`,
                template: 'incidencia-cancelada',
                data: {
                    nombre: datos.nombre_creador,
                    id: datos.id_incidencia,
                    articulo: datos.articulo,
                    descripcion: datos.descripcion_pedido,
                    area: datos.area,
                    canceladoPor: quienCancela
                        ? `${quienCancela.nombres} ${quienCancela.apellidos}`
                        : 'Sistema'
                }
            });
            return true;
        } catch (error) {
            console.error(`No se pudo enviar el mail de cancelacion de la incidencia #${idIncidencia}:`, error.message);
            return false;
        }
    };

    // Datos para el panel del Director.
    // Si no se indica rango, se usan los ultimos 30 dias.
    obtenerDatosDashboard = async ({ desde, hasta } = {}) => {
        const fechaHasta = hasta ?? hoyEnZona();
        const fechaDesde = desde ?? sumarDias(fechaHasta, -(DIAS_POR_DEFECTO - 1));

        if (fechaDesde > fechaHasta) {
            throw new ErrorHttp(400, 'La fecha "desde" no puede ser posterior a "hasta"');
        }
        if (diasEntre(fechaDesde, fechaHasta) > MAX_DIAS_RANGO) {
            throw new ErrorHttp(400, `El rango de fechas no puede superar los ${MAX_DIAS_RANGO} días`);
        }

        const [porEstado, porFecha, prioritarias] = await Promise.all([
            this.incidencias.totalesPorEstado(),
            this.incidencias.totalesPorFecha(fechaDesde, fechaHasta, ZONA_HORARIA),
            this.incidencias.prioritariasAbiertas(
                PRIORIDAD_ALTA,
                [ESTADOS.PENDIENTE, ESTADOS.EN_PROCESO],
                LIMITE_PRIORITARIAS,
                ROLES.SISTEMAS
            )
        ]);

        return {
            total: porEstado.reduce((suma, fila) => suma + fila.total, 0),
            porEstado,
            porFecha: {
                desde: fechaDesde,
                hasta: fechaHasta,
                datos: porFecha
            },
            prioritarias: {
                total: prioritarias[0]?.total ?? 0,
                items: prioritarias.map(({ total, ...incidencia }) => incidencia)
            }
        };
    };

    // Genera el reporte estadistico de incidencias en PDF.
    // Todos los filtros son opcionales; sin filtros incluye todas las incidencias.
    generarInforme = async ({ desde, hasta, estado, idUsuario } = {}) => {
        if (desde && hasta && desde > hasta) {
            throw new ErrorHttp(400, 'La fecha "desde" no puede ser posterior a "hasta"');
        }

        const [filas, director] = await Promise.all([
            this.incidencias.datosInforme({
                desde,
                hasta,
                estado,
                zonaHoraria: ZONA_HORARIA,
                rolSistemas: ROLES.SISTEMAS
            }),
            this.usuarios.obtenerActivoPorId(idUsuario)
        ]);

        let periodo = 'Todas las fechas';
        if (desde && hasta) periodo = `Del ${formatearFechaCorta(desde)} al ${formatearFechaCorta(hasta)}`;
        else if (desde) periodo = `Desde el ${formatearFechaCorta(desde)}`;
        else if (hasta) periodo = `Hasta el ${formatearFechaCorta(hasta)}`;

        const datosPlantilla = {
            filtros: {
                periodo,
                estado: estado ? NOMBRE_ESTADO[estado] : 'Todos'
            },
            generado: {
                fecha: formatearFechaHora(new Date()),
                por: director ? `${director.nombres} ${director.apellidos}` : '-'
            },
            resumen: {
                total: filas.length,
                porEstado: contarPor(filas, 'id_estado', NOMBRE_ESTADO),
                porPrioridad: contarPor(filas, 'prioridad', NOMBRE_PRIORIDAD)
            },
            incidencias: filas.map((fila) => ({
                id: fila.id_incidencia,
                fecha: formatearFechaHora(fila.creado),
                articulo: fila.articulo,
                categoria: fila.categoria,
                area: fila.area,
                pedido: fila.descripcion_pedido,
                prioridadId: fila.prioridad,
                prioridad: NOMBRE_PRIORIDAD[fila.prioridad] ?? '-',
                estadoId: fila.id_estado,
                estado: fila.estado,
                creador: fila.creador,
                asignado: fila.asignado_a
            }))
        };

        const pdf = await generarPdf('incidencias', datosPlantilla);
        return {
            pdf,
            nombreArchivo: `reporte-incidencias-${hoyEnZona()}.pdf`
        };
    };
}
