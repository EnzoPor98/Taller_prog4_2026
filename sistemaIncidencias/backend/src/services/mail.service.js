import { resend } from '../config/resend.js';

export const enviarMail = async ({
    to,
    subject,
    html,
    text
}) => {
    const { data, error } = await resend.emails.send({
        from: process.env.MAIL_FROM,
        to,
        subject,
        html,
        text
    });

    if (error) {
        console.error('Error de Resend:', error);

        throw new Error(error.message);
    }

    return data;
};