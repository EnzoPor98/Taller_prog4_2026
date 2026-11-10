import pool from '../../config/db.js';
import { ROLES } from '../utils/roles.js';

// Capa de datos de incidencias: solo SQL, sin reglas de negocio.
// Las funciones que reciben "client" se usan dentro de una transaccion.
export default class IncidenciasRepository {

    // Rol del usuario logueado (1=director, 2=empleado municipal, 3=empleado de sistemas)
    obtenerRol = async (idUsuario) => {
        const query = `SELECT rol FROM usuarios WHERE id_usuario = $1;`;
        const { rows } = await pool.query(query, [idUsuario]);
        return rows[0]?.rol;
    };

    // Listado con joins. Sistemas ve las asignadas a el, Municipal las creadas por el, Director todas.
    getIncidencias = async (rol, idUsuario) => {
        let query = `SELECT
                            inc.id_incidencia,
                            inc.prioridad,
                            inc.creado,
                            inc.descripcion_pedido,
                            inc.descripcion_resolucion,
                            row_to_json(art) AS articulo,
                            row_to_json(user_create) AS creador,
                            row_to_json(user_asign) AS asignado_a,
                            row_to_json(estado) AS estado
                        FROM incidencias inc
                            INNER JOIN articulos art
                                ON inc.id_articulo = art.id_articulo
                            INNER JOIN usuarios user_create
                                ON inc.creado_por = user_create.id_usuario
                            LEFT JOIN usuarios user_asign
                                ON inc.asignado_a = user_asign.id_usuario
                            INNER JOIN estados estado
                                ON inc.id_estado = estado.id_estado
                                `;
        const params = [];
        if (rol === ROLES.SISTEMAS) {
            params.push(idUsuario);
            query += ` WHERE inc.asignado_a = $1`;
        } else if (rol === ROLES.MUNICIPAL) {
            params.push(idUsuario);
            query += ` WHERE inc.creado_por = $1`;
        }

        query += ` ORDER BY inc.creado ASC`;

        const { rows } = await pool.query(query, params);
        return rows;
    };

    getIncidencia = async (id) => {
        const query = `SELECT
                            inc.id_incidencia,
                            inc.prioridad,
                            inc.creado,
                            inc.descripcion_pedido,
                            inc.descripcion_resolucion,
                            row_to_json(art) AS articulo,
                            row_to_json(user_create) AS creador,
                            row_to_json(user_asign) AS asignado_a,
                            row_to_json(estado) AS estado
                        FROM incidencias inc
                            INNER JOIN articulos art
                                ON inc.id_articulo = art.id_articulo
                            INNER JOIN usuarios user_create
                                ON inc.creado_por = user_create.id_usuario
                            LEFT JOIN usuarios user_asign
                                ON inc.asignado_a = user_asign.id_usuario
                            INNER JOIN estados estado
                                ON inc.id_estado = estado.id_estado
                                WHERE inc.id_incidencia = $1
                                ORDER BY inc.creado ASC`;
        const { rows } = await pool.query(query, [id]);
        return rows;
    };

    // Recibe el client de la transaccion para que el alta y su historial queden atomicos
    createIncidencia = async (client, incidencia) => {
        const {
            id_articulo,
            id_estado,
            creado_por,
            asignado_a,
            creado,
            prioridad,
            descripcion_pedido,
            descripcion_resolucion,
        } = incidencia;

        const query = `INSERT INTO
                  public.incidencias
                  (id_articulo, id_estado, creado_por, asignado_a, creado, prioridad, descripcion_pedido, descripcion_resolucion)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *;`;

        const values = [
            id_articulo,
            id_estado,
            creado_por,
            asignado_a ?? 0,
            creado,
            prioridad,
            descripcion_pedido,
            descripcion_resolucion,
        ];

        const { rows } = await client.query(query, values);
        return rows;
    };

    // Bloquea la fila (FOR UPDATE) para que nadie la modifique mientras dura la transaccion
    obtenerParaActualizar = async (client, idIncidencia) => {
        const query = `
            SELECT id_incidencia, id_estado, creado_por, asignado_a
            FROM incidencias
            WHERE id_incidencia = $1
            FOR UPDATE;
        `;
        const { rows } = await client.query(query, [idIncidencia]);
        return rows[0] ?? null;
    };

    actualizarAsignacion = async (client, idIncidencia, asignadoA, idEstado) => {
        const query = `
            UPDATE incidencias
            SET asignado_a = $1, id_estado = $2
            WHERE id_incidencia = $3
            RETURNING *;
        `;
        const { rows } = await client.query(query, [asignadoA, idEstado, idIncidencia]);
        return rows[0];
    };

    actualizarEstado = async (client, idIncidencia, idEstado) => {
        const query = `
            UPDATE incidencias
            SET id_estado = $1
            WHERE id_incidencia = $2
            RETURNING *;
        `;
        const { rows } = await client.query(query, [idEstado, idIncidencia]);
        return rows[0];
    };

    // Actualiza el estado de la incidencia y su descripcion de resolucion en una sola operacion.
    actualizarEstadoYResolucion = async (client, idIncidencia, idEstado, descripcionResolucion) => {
        const query = `
            UPDATE incidencias
            SET id_estado = $1, descripcion_resolucion = $2
            WHERE id_incidencia = $3
            RETURNING *;
        `;
        const { rows } = await client.query(query, [idEstado, descripcionResolucion, idIncidencia]);
        return rows[0];
    };

    // fecha_hora_estado toma el valor por defecto de la base (NOW)
    registrarHistorial = async (client, idIncidencia, idEstado) => {
        const query = `
            INSERT INTO incidencias_estados (id_incidencia, id_estado)
            VALUES ($1, $2);
        `;
        await client.query(query, [idIncidencia, idEstado]);
    };

    // Datos necesarios para armar el mail de notificacion
    obtenerDatosNotificacion = async (idIncidencia) => {
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

    // Datos de la incidencia para avisarle al empleado de sistemas que la recibio.
    // Se usa para el modal en tiempo real y para el contenido del mensaje.
    obtenerDatosAsignacion = async (idIncidencia) => {
        const query = `
            SELECT
                inc.id_incidencia,
                inc.descripcion_pedido,
                inc.prioridad,
                inc.creado,
                art.descripcion AS articulo,
                ar.descripcion AS area,
                creador.nombres AS nombre_creador,
                creador.apellidos AS apellido_creador,
                est.descripcion AS estado
            FROM incidencias inc
                INNER JOIN articulos art ON art.id_articulo = inc.id_articulo
                INNER JOIN areas ar ON ar.id_area = art.id_area
                INNER JOIN usuarios creador ON creador.id_usuario = inc.creado_por
                INNER JOIN estados est ON est.id_estado = inc.id_estado
            WHERE inc.id_incidencia = $1;
        `;
        const { rows } = await pool.query(query, [idIncidencia]);
        return rows[0] ?? null;
    };

    // ---------------------------------------------------------------------
    // Dashboard
    // ---------------------------------------------------------------------

    // Total por cada estado (incluye los estados sin incidencias, con total 0)
    totalesPorEstado = async () => {
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
    totalesPorFecha = async (desde, hasta, zonaHoraria) => {
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
    prioritariasAbiertas = async (prioridad, estadosAbiertos, limite, rolSistemas) => {
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
                LEFT JOIN usuarios asignado ON asignado.id_usuario = inc.asignado_a
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
    datosInforme = async ({ desde, hasta, estado, zonaHoraria, rolSistemas }) => {
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
                LEFT JOIN usuarios asignado ON asignado.id_usuario = inc.asignado_a
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
}
