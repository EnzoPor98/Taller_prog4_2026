import pool from "../../config/db.js";

export default class AreasRepository {
    getAreas = async () => {
        const sql = `SELECT * FROM areas where activo=1;`;
        const { rows } = await pool.query(sql);
        return rows;
    };
}
