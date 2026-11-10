import pool from '../../config/db.js';

// Nunca se devuelve la columna contrasenia
const CAMPOS_PUBLICOS = 'id_usuario, id_area, nombres, apellidos, usuario, rol';

// Capa de datos de usuarios: solo SQL, sin reglas de negocio.
export default class UsuariosRepository {

    // Usuarios activos, opcionalmente filtrados por rol
    listarActivos = async ({ rol } = {}) => {
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

    // "db" es el pool por defecto, o el client cuando se llama dentro de una transaccion
    obtenerActivoPorId = async (idUsuario, db = pool) => {
        const query = `SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id_usuario = $1 AND activo = 1;`;
        const { rows } = await db.query(query, [idUsuario]);
        return rows[0] ?? null;
    };
}
