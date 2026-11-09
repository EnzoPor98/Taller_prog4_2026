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

// ---------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------

// Total por cada estado (incluye los estados sin incidencias, con total 0)
export const totalesPorEstado = async () => {
    const query = `
        SELECT
            est.id_estado,
            est.descripcion AS estado,
            COUNT(inc.id_incidencia)::int AS total
        FROM estados est
            LEFT JOIN incidencias inc ON inc.id_estado = est.id_estado
        GROUP BY est.id_estado, est.descripcion
        ORDER BY est.id_estado;
    `;
    const { rows } = await pool.query(query);
    return rows;
};

// Cantidad de incidencias creadas por dia entre desde y hasta (inclusive).
// generate_series arma todos los dias del rango para que los dias sin incidencias aparezcan con 0.
// La fecha se calcula en la zona horaria indicada para que no se corra el dia por UTC.
export const totalesPorFecha = async (desde, hasta, zonaHoraria) => {
    const query = `
        SELECT
            to_char(dia, 'YYYY-MM-DD') AS fecha,
            COUNT(inc.id_incidencia)::int AS total
        FROM generate_series($1::date, $2::date, INTERVAL '1 day') AS dia
            LEFT JOIN incidencias inc
                ON (inc.creado AT TIME ZONE $3)::date = dia::date
        GROUP BY dia
        ORDER BY dia;
    `;
    const { rows } = await pool.query(query, [desde, hasta, zonaHoraria]);
    return rows;
};

// Incidencias de una prioridad que siguen abiertas, las mas viejas primero.
// "total" es la cantidad completa (sin el LIMIT) gracias a COUNT(*) OVER ().
// asignado_a queda null mientras la incidencia no la tenga un empleado de sistemas.
export const prioritariasAbiertas = async (prioridad, estadosAbiertos, limite, rolSistemas) => {
    const query = `
        SELECT
            inc.id_incidencia,
            inc.creado,
            inc.descripcion_pedido,
            art.descripcion AS articulo,
            est.id_estado,
            est.descripcion AS estado,
            CASE WHEN asignado.rol = $4
                THEN asignado.nombres || ' ' || asignado.apellidos
            END AS asignado_a,
            COUNT(*) OVER ()::int AS total
        FROM incidencias inc
            INNER JOIN articulos art ON art.id_articulo = inc.id_articulo
            INNER JOIN estados est ON est.id_estado = inc.id_estado
            INNER JOIN usuarios asignado ON asignado.id_usuario = inc.asignado_a
        WHERE inc.prioridad = $1
            AND inc.id_estado = ANY($2::int[])
        ORDER BY inc.creado ASC
        LIMIT $3;
    `;
    const { rows } = await pool.query(query, [prioridad, estadosAbiertos, limite, rolSistemas]);
    return rows;
};

// ---------------------------------------------------------------------
// Informe PDF
// ---------------------------------------------------------------------

// Incidencias con todos sus datos para el reporte. Los filtros son opcionales (null = sin filtro).
export const datosInforme = async ({ desde, hasta, estado, zonaHoraria, rolSistemas }) => {
    const query = `
        SELECT
            inc.id_incidencia,
            inc.creado,
            inc.prioridad,
            inc.descripcion_pedido,
            art.descripcion AS articulo,
            cat.descripcion AS categoria,
            ar.descripcion AS area,
            creador.nombres || ' ' || creador.apellidos AS creador,
            CASE WHEN asignado.rol = $5
                THEN asignado.nombres || ' ' || asignado.apellidos
            END AS asignado_a,
            est.id_estado,
            est.descripcion AS estado
        FROM incidencias inc
            INNER JOIN articulos art ON art.id_articulo = inc.id_articulo
            INNER JOIN categorias cat ON cat.id_categoria = art.id_categoria
            INNER JOIN areas ar ON ar.id_area = art.id_area
            INNER JOIN usuarios creador ON creador.id_usuario = inc.creado_por
            INNER JOIN usuarios asignado ON asignado.id_usuario = inc.asignado_a
            INNER JOIN estados est ON est.id_estado = inc.id_estado
        WHERE ($1::date IS NULL OR (inc.creado AT TIME ZONE $4)::date >= $1::date)
            AND ($2::date IS NULL OR (inc.creado AT TIME ZONE $4)::date <= $2::date)
            AND ($3::int IS NULL OR inc.id_estado = $3)
        ORDER BY inc.creado DESC;
    `;
    const params = [desde ?? null, hasta ?? null, estado ?? null, zonaHoraria, rolSistemas];
    const { rows } = await pool.query(query, params);
    return rows;
};
