import pool from "../../config/db.js";

export default class ArticuloRepository {
  getArticulos = async () => {
    const sql = `
      SELECT
        art.*,
        row_to_json(ar) AS area, 
        row_to_json(cat) AS categoria 
      FROM articulos art
      INNER JOIN areas ar
        ON ar.id_area = art.id_area
      INNER JOIN categorias cat
        ON cat.id_categoria = art.id_categoria
      WHERE art.activo = 1;
    `;

    const { rowCount, rows } = await pool.query(sql);

    if (rowCount === 0) {
      return null;
    }

    return rows;
  };

  getArticulo = async (id) => {
    const sql = `
      SELECT
          *
      FROM 
          articulos
      WHERE 
          id_articulo = $1 AND activo = 1;
    `;

    const { rowCount, rows } = await pool.query(sql, [id]);

    if (rowCount === 0) {
      return null;
    }

    return rows[0];
  };

  createArticulo = async (articulo) => {
    const { descripcion, id_categoria, id_area } = articulo;

    const sql = `
      INSERT INTO
          articulos (id_area, id_categoria, descripcion, activo)
      VALUES
          ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rowCount, rows } = await pool.query(sql, [
      id_area,
      id_categoria,
      descripcion,
      1,
    ]);

    if (rowCount === 0) {
      return null;
    }

    return rows[0];
  };

  updateArticulo = async (articulo) => {
    const { id, descripcion, id_categoria, id_area } = articulo;

    const sql = `
      UPDATE
          articulos
      SET
          id_area = $2,
          id_categoria = $3,
          descripcion = $4
      WHERE
          id_articulo = $1 AND activo = 1
      RETURNING *;
    `;

    const { rowCount, rows } = await pool.query(sql, [
      id,
      id_area,
      id_categoria,
      descripcion,
    ]);

    if (rowCount === 0) {
      return null;
    }

    return rows[0];
  };

  deleteArticulo = async (id) => {
    const sql = `
      UPDATE
          articulos
      SET
          activo = 0
      WHERE
          id_articulo = $1
      RETURNING *;
    `;

    const { rowCount, rows } = await pool.query(sql, [id]);

    if (rowCount === 0) {
      return null;
    }

    return rows[0];
  };
}
