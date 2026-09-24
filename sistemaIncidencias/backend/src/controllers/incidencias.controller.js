import pool from '../../config/db.js';

const getIncidencias = async (req, res) => {
    try {
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
                            INNER JOIN usuarios user_asign
                                ON inc.asignado_a = user_asign.id_usuario
                            INNER JOIN estados estado
                                ON inc.id_estado = estado.id_estado`;

        const result = await pool.query(query);
        const areas = result.rows;
        return res.status(200).json(areas);
    } catch (error) {
        console.log("🚀 ~ getIncidencias ~ error:", error)
        return res.status(500).json({ mensaje: 'Ocurrio un error al recuperar las incicencias' });
    }

};



export {
    getIncidencias
};

//    {
//         "id_incidencia": 4,
//         "id_estado": 1,
//         "creado": "2026-09-13T18:52:51.346Z",
//         "prioridad": 1,
//         "descripcion_pedido": "No carga la batería",
//         "descripcion_resolucion": ""
//     }