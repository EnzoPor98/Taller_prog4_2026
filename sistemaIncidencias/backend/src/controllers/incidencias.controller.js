import pool from '../../config/db.js';

const getIncidencias = async (req, res) => {
    try {
        const idUsuario = req.usuario.id;
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
                            INNER JOIN usuarios user_asign
                                ON inc.asignado_a = user_asign.id_usuario
                            INNER JOIN estados estado
                                ON inc.id_estado = estado.id_estado
                                
                                `;
        const params = [];
        if (idUsuario) {
            params.push(idUsuario);
            query += ` WHERE inc.asignado_a = $1`;
        }

        query += ` ORDER BY inc.id_incidencia ASC`;

        const result = await pool.query(query, params);
        const incidencias = result.rows;
        return res.status(200).json(incidencias);
    } catch (error) {
        console.log("🚀 ~ getIncidencias ~ error:", error)
        return res.status(500).json({ mensaje: 'Ocurrio un error al recuperar las incicencias' });
    }

};

const updateIncidencia = async (req, res) => {
    const {
        finalizada, descripcion_resolucion
    } = req.body;
    const id_incidencia= req.params.id;
    console.log("🚀 ~ updateIncidencia ~ id_incidencia:", id_incidencia)
    let status= null;
    if (finalizada == true) {
        status = 3;
    
    }



        try {
            const queryUpdate = `
  UPDATE incidencias
  SET
    id_estado = $1,
    descripcion_resolucion = $2
  WHERE id_incidencia = $3
  RETURNING *;
`;
        const values = [
            status, descripcion_resolucion, id_incidencia
        ]
        const result = await pool.query(queryUpdate, values);

 const query = `
        INSERT INTO incidencias_estados (id_incidencia,id_estado, fecha_hora_estado)
        VALUES ($1, $2, $3)
        RETURNING *;
        `;
        await pool.query(query, [Number(id_incidencia), Number(status), new Date().toISOString()]);


        return res.status(200).json({ mensaje: 'Categoría actualizada con éxito' });


    } catch (error) {
        console.log("🚀 ~ deleteCategory ~ error:", error)
        return res.status(500).json({ mensaje: 'Ocurrio un error al actualizar la categoria' });

    }

}

export {
    getIncidencias,
    updateIncidencia
};
