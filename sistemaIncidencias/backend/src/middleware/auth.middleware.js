import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    jwt.verify(token, JWT_SECRET, (error, decoded) => {
        if (error) {
            return res.status(403).json({ mensaje: 'Token inválido o expirado' });
        }
        req.usuario = decoded;
        next();
    });
};

// Usar despues de verificarToken. Ej: autorizarUsuarios([ROLES.DIRECTOR])
export const autorizarUsuarios = (rolesPermitidos = []) => {
    return (req, res, next) => {
        const rol = req.usuario?.rol;

        if (!rolesPermitidos.includes(rol)) {
            return res.status(403).json({ mensaje: 'Acceso denegado' });
        }

        next();
    };
};
