import pool from '../../config/db.js';

// Capa de datos de roles: solo SQL, sin reglas de negocio.
export default class RolesRepository {

    listarRoles = async () => {
        const { rows } = await pool.query(
            'SELECT id_rol, nombre, descripcion FROM roles ORDER BY id_rol;'
        );
        return rows;
    };
}
