import { Router } from 'express';

import categoriasRoutes from './categorias.routes.js';
import authRoutes from './auth.routes.js';
import articulosRoutes from './articulos.routes.js';
import areasRoutes from './areas.routes.js';
import incidenciasRoutes from './incidencias.routes.js';
import mailRoutes from './mail.routes.js';
import usuariosRoutes from './usuarios.routes.js';





// Usar una ruta concentradora es mas limpia
const router = Router();

router.use('/auth', authRoutes);
router.use('/areas', areasRoutes);
router.use('/mail', mailRoutes);
router.use('/articulos', articulosRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/incidencias', incidenciasRoutes);
router.use('/usuarios', usuariosRoutes);




export default router;