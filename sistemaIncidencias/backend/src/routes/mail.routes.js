import { Router } from 'express';
import { enviarMail } from '../services/mail.service.js';

const router = Router();

router.post('/test', async (req, res) => {
    try {
        const { to, subject, html, text } = req.body;

        if (!to || !subject || (!html && !text)) {
            return res.status(400).json({
                mensaje: 'Se requiere to, subject y html o text'
            });
        }

        const data = await enviarMail({
            to,
            subject,
            html,
            text
        });

        return res.status(200).json({
            mensaje: 'Correo enviado correctamente',
            id: data.id
        });
    } catch (error) {
        return res.status(500).json({
            mensaje: 'Error al enviar el correo',
            error: error.message
        });
    }
});

export default router;