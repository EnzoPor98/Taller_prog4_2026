import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({
            mensaje: errores.array()[0].msg,
            errores: errores.array(),
        });
    }
    next();
};