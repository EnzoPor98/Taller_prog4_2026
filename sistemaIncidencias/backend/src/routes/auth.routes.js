import { Router } from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.post(
    '/register',
    [
        body('usuario').notEmpty().withMessage('Usuario obligatorio'),
        body('contrasenia').notEmpty().withMessage('Contraseña obligatoria'),
        body('nombre').notEmpty().withMessage('Nombre obligatorio'),
        body('apellido').notEmpty().withMessage('Apellido obligatorio'),
        body('rol').notEmpty().withMessage('Rol obligatorio'),
        body('area').notEmpty().withMessage('Área obligatoria'),
    ],
    validate,
    register
);

router.post(
    '/login',
    [
        body('usuario').notEmpty().withMessage('Usuario obligatorio'),
        body('contrasenia').notEmpty().withMessage('Contraseña obligatoria'),
    ],
    validate,
    login
);

export default router;