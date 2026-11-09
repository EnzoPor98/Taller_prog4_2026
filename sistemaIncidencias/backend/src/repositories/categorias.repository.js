import pool from "../../config/db.js";

// Ejecuta `fn(client)` dentro de una transacción: COMMIT si sale bien, ROLLBACK y rethrow si falla
const conTransaccion = async (fn) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const resultado = await fn(client);
        await client.query('COMMIT');
        return resultado;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export default class CategoriasRepository {
    getCategorias = async () => {
        const sql = `SELECT * FROM categorias where activo=1;`;
        const { rows } = await pool.query(sql);
        return rows;
    };

    getCategoria = async (id) => {
        const sql = `SELECT * FROM categorias where id_categoria=$1;`;
        const { rows } = await pool.query(sql, [id]);
        return rows;
    };

    createCategoria = ({ descripcion, activo }) =>
        conTransaccion(async (client) => {
            const sql = `
            INSERT INTO categorias (descripcion, activo)
            VALUES ($1, $2)
            RETURNING *;
            `;
            const { rows } = await client.query(sql, [descripcion, activo]);
            return rows[0];
        });

    updateCategoria = ({ id, descripcion, activo }) =>
        conTransaccion(async (client) => {
            const sql = `
            UPDATE categorias
            SET
              descripcion = $1,
              activo = $2
            WHERE id_categoria = $3
            RETURNING *;
            `;
            const { rows } = await client.query(sql, [descripcion, activo, id]);
            return rows[0];
        });

    deleteCategoria = (id) =>
        conTransaccion(async (client) => {
            const sql = `UPDATE categorias SET activo = 0  WHERE id_categoria = $1 RETURNING *;`;
            const { rows } = await client.query(sql, [Number(id)]);
            return rows[0];
        });
}
