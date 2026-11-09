import pool from '../../config/db.js';

export const listarRoles = async () => {
    const { rows } = await pool.query(
        'SELECT id_rol, nombre, descripcion FROM roles ORDER BY id_rol;'
    );
    return rows;
};
