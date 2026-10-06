import jwt from 'jsonwebtoken';
import pool from '../../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
    const { usuario, contrasenia, nombre, apellido, rol, area } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const existeQuery = `SELECT id_usuario FROM usuarios WHERE usuario = $1;`;
        const existe = await pool.query(existeQuery, [usuario]);

        if (existe.rows.length > 0) {
            return res.status(500).json({ mensaje: 'El usuario ya existe' });
        }

        const query = `
        INSERT INTO usuarios (id_area,nombres,apellidos, usuario, contrasenia,avatar,rol,activo)
        VALUES ($1, $2, $3, $4, encode(digest($5, 'sha256'), 'hex'),$6,$7,$8)
        RETURNING id_usuario, usuario;
        `;
        const values = [
            Number(area),
            nombre,
            apellido,
            usuario,
            contrasenia,
            " ",//Forzar, lo ideal seria tener un avatar, o que permita null
            Number(rol),
            1];
        const result = await pool.query(query, values);

        await client.query('COMMIT');

        return res.status(200).json({ mensaje: 'Usuario creado con éxito', usuario: result.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.log("🚀 ~ register ~ error:", error)
        return res.status(500).json({ mensaje: 'Ocurrio un error en la creacion del usuario' });
    } finally {
        client.release();
    }
};

const login = async (req, res) => {
    const { usuario, contrasenia } = req.body;

    try {
        const query = `
        SELECT * FROM usuarios
        WHERE
        activo = 1 AND
        usuario = $1 AND
        contrasenia = encode(digest($2, 'sha256'), 'hex');
        `;
        const values = [usuario, contrasenia];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        const user = result.rows[0];
        const token = jwt.sign(
            { id: user.id_usuario, usuario: user.usuario },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.status(200).json({
            mensaje: 'Login exitoso',
            token,
            'usuario': user

        });
    } catch (error) {
        console.log("🚀 ~ login ~ error:", error)
        return res.status(500).json({ mensaje: 'Ocurrio un error al iniciar sesion' });
    }
};

export {
    register,
    login
};