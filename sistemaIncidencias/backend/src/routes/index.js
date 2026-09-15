import { Router } from 'express';

import categoriasRoutes from './categories.routes.js';


// Usar una ruta concentradora es mas limpia
const router = Router();

router.use('/categories', categoriasRoutes);


export default router;