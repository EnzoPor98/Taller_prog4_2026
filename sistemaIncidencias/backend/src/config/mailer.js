import 'dotenv/config';
import nodemailer from 'nodemailer';

if (!process.env.SMTP_HOST) {
    throw new Error('Falta configurar SMTP_HOST');
}

const puerto = Number(process.env.SMTP_PORT) || 587;

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: puerto,
    secure: puerto === 465,
    auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined
});
