import pool from '../../config/db.js';

// Capa de datos de incidencias: solo SQL, sin reglas de negocio.
// Las funciones que reciben "client" se usan dentro de una transaccion.

// Bloquea la fila (FOR UPDATE) para que nadie la modifique mientras dura la transaccion
export const obtenerParaActualizar = async (client, idIncidencia) => {
    const query = `
        SELECT id_incidencia, id_estado, creado_por, asignado_a
        FROM incidencias
        WHERE id_incidencia = $1
        FOR UPDATE;
    `;
    const { rows } = await client.query(query, [idIncidencia]);
    return rows[0] ?? null;
};

export const actualizarAsignacion = async (client, idIncidencia, asignadoA, idEstado) => {
    const query = `
        UPDATE incidencias
        SET asignado_a = $1, id_estado = $2
        WHERE id_incidencia = $3
        RETURNING *;
    `;
    const { rows } = await client.query(query, [asignadoA, idEstado, idIncidencia]);
    return rows[0];
};

export const actualizarEstado = async (client, idIncidencia, idEstado) => {
    const query = `
        UPDATE incidencias
        SET id_estado = $1
        WHERE id_incidencia = $2
        RETURNING *;
    `;
    const { rows } = await client.query(query, [idEstado, idIncidencia]);
    return rows[0];
};

// fecha_hora_estado toma el valor por defecto de la base (NOW)
export const registrarHistorial = async (client, idIncidencia, idEstado) => {
    const query = `
        INSERT INTO incidencias_estados (id_incidencia, id_estado)
        VALUES ($1, $2);
    `;
    await client.query(query, [idIncidencia, idEstado]);
};

// Datos necesarios para armar el mail de notificacion
export const obtenerDatosNotificacion = async (idIncidencia) => {
    const query = `
        SELECT
            inc.id_incidencia,
            inc.descripcion_pedido,
            art.descripcion AS articulo,
            ar.descripcion AS area,
            creador.usuario AS email_creador,
            creador.nombres AS nombre_creador
        FROM incidencias inc
            INNER JOIN articulos art ON art.id_articulo = inc.id_articulo
            INNER JOIN areas ar ON ar.id_area = art.id_area
            INNER JOIN usuarios creador ON creador.id_usuario = inc.creado_por
        WHERE inc.id_incidencia = $1;
    `;
    const { rows } = await pool.query(query, [idIncidencia]);
    return rows[0] ?? null;
};
