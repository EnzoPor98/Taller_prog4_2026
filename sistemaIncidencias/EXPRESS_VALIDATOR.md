# Express Validator Setup

Configuración de express-validator para validación de requests en el backend.

## Endpoints validados
- POST /api/auth/register
- POST /api/auth/login
- GET /api/categorias
- POST /api/categorias
- PUT /api/categorias/:id
- DELETE /api/categorias/:id

## Middleware
- validate.middleware.js centraliza el manejo de errores de validación
