import { Router } from 'express';

import categoriasRoutes from './categories.routes.js';
import authRoutes from './auth.routes.js';
import articulosRoutes from './articulos.routes.js';
import areasRoutes from './areas.routes.js';
import incidenciasRoutes from './incidencias.routes.js';




// Usar una ruta concentradora es mas limpia
const router = Router();

router.use('/auth', authRoutes);
router.use('/areas', areasRoutes);
router.use('/articulos', articulosRoutes);
router.use('/categories', categoriasRoutes);
router.use('/incidencias', incidenciasRoutes);




export default router;