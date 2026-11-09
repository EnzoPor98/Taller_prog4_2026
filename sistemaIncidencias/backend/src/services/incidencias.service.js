import pool from '../../config/db.js';
import * as incidenciasData from '../data/incidencias.data.js';
import * as usuariosData from '../data/usuarios.data.js';
import { enviarMail } from './mail.service.js';
import { ErrorHttp } from '../utils/errores.js';
import { ROLES } from '../utils/roles.js';
import { ESTADOS } from '../utils/estados.js';

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
