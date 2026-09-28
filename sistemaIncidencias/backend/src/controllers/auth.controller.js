import jwt from 'jsonwebtoken';
import pool from '../../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
    const { usuario, contrasenia } = req.body;

    if (!usuario) {
        return res.status(500).json({ mensaje: 'Usuario obligatorio' });
    }
    if (!contrasenia) {
        return res.status(500).json({ mensaje: 'Contraseña obligatoria' });
    }

    try {
        const existeQuery = `SELECT id_usuario FROM usuarios WHERE usuario = $1;`;
        const existe = await pool.query(existeQuery, [usuario]);

        if (existe.rows.length > 0) {
            return res.status(500).json({ mensaje: 'El usuario ya existe' });
        }

        const query = `
        INSERT INTO usuarios (usuario, contrasenia)
        VALUES ($1, crypt($2, gen_salt('bf')))
        RETURNING id_usuario, usuario;
        `;
        const values = [usuario, contrasenia];
        const result = await pool.query(query, values);

        return res.status(200).json({ mensaje: 'Usuario creado con éxito', usuario: result.rows[0] });
    } catch (error) {
        console.log("🚀 ~ register ~ error:", error)
        return res.status(500).json({ mensaje: 'Ocurrio un error en la creacion del usuario' });
    }
};

const login = async (req, res) => {
    const { usuario, contrasenia } = req.body;


    if (!usuario) {
        return res.status(500).json({ mensaje: 'Usuario obligatorio' });
    }
    if (!contrasenia) {
        return res.status(500).json({ mensaje: 'Contraseña obligatoria' });
    }
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