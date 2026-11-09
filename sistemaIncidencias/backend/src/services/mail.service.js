import { readFile } from 'node:fs/promises';
import Handlebars from 'handlebars';
import { transporter } from '../config/mailer.js';

export async function enviarMail({ to, subject, template, data }) {
    const ruta = new URL(`../templates/emails/${template}.hbs`, import.meta.url);
    const contenido = await readFile(ruta, 'utf8');
    const html = Handlebars.compile(contenido)(data);

    return transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject,
        html
    });
}