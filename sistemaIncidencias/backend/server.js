
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import apiRouter from './src/routes/index.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(
    morgan((tokens, req, res) => {
        const timestamp = new Date().toISOString();

        return `${timestamp} [TFI-PROG-4] ${tokens.method(req, res)} ${tokens.url(req, res)} ${tokens.status(req, res)} ${tokens['response-time'](req, res)} ms`;
    })
);

// Healthcheck
app.get('/healthcheck', (req, res) => {
    res.json({
        mensaje: '¡El servidor está funcionando correctamente!'
    });
});

// Rutas
app.use('/api', apiRouter);

app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

// 404
app.use((req, res) => {
    res.status(404).json({
        error: `Cannot GET ${req.originalUrl}`
    });
});

// Exportar aplicación para Vercel
export default app;
