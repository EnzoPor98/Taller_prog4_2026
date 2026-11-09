import pool from '../../config/db.js';

// Nunca se devuelve la columna contrasenia
const CAMPOS_PUBLICOS = 'id_usuario, id_area, nombres, apellidos, usuario, rol';

export const listarActivos = async ({ rol } = {}) => {
    const params = [];
    let query = `SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE activo = 1`;

    if (rol) {
        params.push(rol);
        query += ` AND rol = $${params.length}`;
    }

    query += ' ORDER BY apellidos, nombres;';

    const { rows } = await pool.query(query, params);
    return rows;
};

// "db" puede ser el pool o un client dentro de una transaccion
export const obtenerActivoPorId = async (db, idUsuario) => {
    const query = `SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id_usuario = $1 AND activo = 1;`;
    const { rows } = await db.query(query, [idUsuario]);
    return rows[0] ?? null;
};
