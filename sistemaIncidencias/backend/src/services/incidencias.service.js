import pool from '../../config/db.js';
import * as incidenciasData from '../data/incidencias.data.js';
import * as usuariosData from '../data/usuarios.data.js';
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

// Asigna la incidencia a un empleado de sistemas y la pasa a "En Proceso".
// Se permite reasignar mientras siga en proceso.
export const asignarIncidencia = (idIncidencia, idEmpleado) => enTransaccion(async (client) => {
    const incidencia = await incidenciasData.obtenerParaActualizar(client, idIncidencia);
    if (!incidencia) {
        throw new ErrorHttp(404, 'Incidencia no encontrada');
    }

    const asignable = [ESTADOS.PENDIENTE, ESTADOS.EN_PROCESO].includes(incidencia.id_estado);
    if (!asignable) {
        throw new ErrorHttp(409, 'Solo se pueden asignar incidencias pendientes o en proceso');
    }

    const empleado = await usuariosData.obtenerActivoPorId(client, idEmpleado);
    if (!empleado || empleado.rol !== ROLES.SISTEMAS) {
        throw new ErrorHttp(400, 'El usuario indicado no es un empleado activo del área de sistemas');
    }

    const actualizada = await incidenciasData.actualizarAsignacion(
        client, idIncidencia, idEmpleado, ESTADOS.EN_PROCESO
    );

    // Solo se registra en el historial si el estado cambio
    if (incidencia.id_estado !== ESTADOS.EN_PROCESO) {
        await incidenciasData.registrarHistorial(client, idIncidencia, ESTADOS.EN_PROCESO);
    }

    return actualizada;
});

// Cancela una incidencia pendiente.
// El director puede cancelar cualquiera; el empleado municipal solo las propias.
export const cancelarIncidencia = async (idIncidencia, usuario) => {
    const cancelada = await enTransaccion(async (client) => {
        const incidencia = await incidenciasData.obtenerParaActualizar(client, idIncidencia);
        if (!incidencia) {
            throw new ErrorHttp(404, 'Incidencia no encontrada');
        }

        if (usuario.rol === ROLES.MUNICIPAL && incidencia.creado_por !== usuario.id) {
            throw new ErrorHttp(403, 'Solo podés cancelar incidencias creadas por vos');
        }

        if (incidencia.id_estado !== ESTADOS.PENDIENTE) {
            throw new ErrorHttp(409, 'Solo se pueden cancelar incidencias pendientes');
        }

        const actualizada = await incidenciasData.actualizarEstado(client, idIncidencia, ESTADOS.CANCELADA);
        await incidenciasData.registrarHistorial(client, idIncidencia, ESTADOS.CANCELADA);
        return actualizada;
    });

    // El mail se envia fuera de la transaccion: si falla, la cancelacion ya quedo guardada
    const notificado = await notificarCancelacion(idIncidencia, usuario.id);

    return { incidencia: cancelada, notificado };
};

const notificarCancelacion = async (idIncidencia, idUsuarioQueCancela) => {
    try {
        const datos = await incidenciasData.obtenerDatosNotificacion(idIncidencia);
        const quienCancela = await usuariosData.obtenerActivoPorId(pool, idUsuarioQueCancela);

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

// ---------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------

const DIAS_POR_DEFECTO = 30;
const MAX_DIAS_RANGO = 366;
const PRIORIDAD_ALTA = 1;
const LIMITE_PRIORITARIAS = 10;

// Datos para el panel del Director.
// Si no se indica rango, se usan los ultimos 30 dias.
export const obtenerDatosDashboard = async ({ desde, hasta } = {}) => {
    const fechaHasta = hasta ?? hoyEnZona();
    const fechaDesde = desde ?? sumarDias(fechaHasta, -(DIAS_POR_DEFECTO - 1));

    if (fechaDesde > fechaHasta) {
        throw new ErrorHttp(400, 'La fecha "desde" no puede ser posterior a "hasta"');
    }
    if (diasEntre(fechaDesde, fechaHasta) > MAX_DIAS_RANGO) {
        throw new ErrorHttp(400, `El rango de fechas no puede superar los ${MAX_DIAS_RANGO} días`);
    }

    const [porEstado, porFecha, prioritarias] = await Promise.all([
        incidenciasData.totalesPorEstado(),
        incidenciasData.totalesPorFecha(fechaDesde, fechaHasta, ZONA_HORARIA),
        incidenciasData.prioritariasAbiertas(
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

// ---------------------------------------------------------------------
// Informe PDF
// ---------------------------------------------------------------------

const porcentaje = (parte, total) => (total === 0 ? 0 : Math.round((parte / total) * 100));

// Cuenta cuantas incidencias hay de cada valor (incluye los valores con 0)
const contarPor = (filas, campo, nombres) => Object.entries(nombres).map(([id, nombre]) => {
    const total = filas.filter((fila) => fila[campo] === Number(id)).length;
    return { id: Number(id), nombre, total, porcentaje: porcentaje(total, filas.length) };
});

// Genera el reporte estadistico de incidencias en PDF.
// Todos los filtros son opcionales; sin filtros incluye todas las incidencias.
export const generarInforme = async ({ desde, hasta, estado, idUsuario } = {}) => {
    if (desde && hasta && desde > hasta) {
        throw new ErrorHttp(400, 'La fecha "desde" no puede ser posterior a "hasta"');
    }

    const [filas, director] = await Promise.all([
        incidenciasData.datosInforme({
            desde,
            hasta,
            estado,
            zonaHoraria: ZONA_HORARIA,
            rolSistemas: ROLES.SISTEMAS
        }),
        usuariosData.obtenerActivoPorId(pool, idUsuario)
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
