import pool from '../../config/db.js';

export const getAreas = async (req, res) => {
    try {
        const query = `SELECT * FROM areas where activo=1;`;
        const result = await pool.query(query);
        const areas = result.rows;
        return res.status(200).json(areas);
    } catch (error) {
        return res.status(500).json({ mensaje: 'Ocurrio un error al recuperar las areas' });
    }

};

