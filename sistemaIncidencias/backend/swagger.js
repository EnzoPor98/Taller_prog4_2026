import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Incidencias - Prog IV',
      version: '1.0.0',
      description: 'Documentación de API',
    },
    tags: [
      { name: 'Areas',      description: 'Endpoints de áreas' },
      { name: 'Articulos',  description: 'Endpoints de artículos' },
      { name: 'Categorias', description: 'Endpoints de categorías' },
      { name: 'Incidencias',description: 'Endpoints de incidencias' },
      { name: 'Auth',       description: 'Endpoints de autenticación' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
   apis: [path.join(__dirname, 'src/routes/*.js')],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;