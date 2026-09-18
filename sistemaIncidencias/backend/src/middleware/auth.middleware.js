import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    jwt.verify(token, JWT_SECRET, (error, decoded) => {
        if (error) {
            console.log("🚀 ~ verificarToken ~ error:", error)
            return res.status(403).json({ mensaje: 'Token inválido o expirado' });
        }
        req.usuario = decoded;
        next();
    });
};

export default verificarToken;