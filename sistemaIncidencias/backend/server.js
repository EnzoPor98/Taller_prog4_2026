
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import pool from './config/db.js';
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
app.get('/db-check', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                NOW() AS fecha,
                current_database() AS base_datos,
                current_user AS usuario
        `);

        res.json({
            conectado: true,
            mensaje: 'Conexión exitosa con Supabase',
            datos: result.rows[0]
        });

    } catch (error) {
        console.error('Error de conexión:', error);

        res.status(500).json({
            conectado: false,
            mensaje: 'Error al conectar con PostgreSQL',
            error: error.message
        });
    }
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
