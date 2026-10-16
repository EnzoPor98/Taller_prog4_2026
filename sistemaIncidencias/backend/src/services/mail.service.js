import { readFile } from 'node:fs/promises';
import Handlebars from 'handlebars';
import { resend } from '../config/resend.js';

export async function enviarMail({ to, subject, template, data }) {
    const ruta = new URL(`../templates/emails/${template}.hbs`, import.meta.url);
    const contenido = await readFile(ruta, 'utf8');
    const html = Handlebars.compile(contenido)(data);

    const { data: resultado, error } = await resend.emails.send({
        from: process.env.MAIL_FROM,
        to,
        subject,
        html
    });

    if (error) throw new Error(error.message);

    return resultado;
}