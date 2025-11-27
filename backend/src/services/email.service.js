import nodemailer from 'nodemailer';
import path from 'path';
import { emailConfig } from '../config/configEnv.js';

export const sendEmail = async (to, subject, html) => {
    try {
        const transporter = nodemailer.createTransport({
            service: emailConfig.service,
            auth: {
                user: emailConfig.user,
                pass: emailConfig.pass,
            },
        });

        const attachments = [];

        if (!html || typeof html !== "string") {
            throw new Error("El template HTML es inválido o está vacío.");
        }

        //! esta foto es para email de ingreso de bici
        if (html.includes('cid:header')) {
            attachments.push({
                filename: 'headerEmailIngreso.png',
                path: path.join(process.cwd(), 'src/assets/headerEmailIngreso.png'),
                cid: 'header',
                contentDisposition: 'inline',
                contentTransferEncoding: 'base64',
            });
        }

        //! esta foto se usa en el email de solicitud de reserva
        if (html.includes('cid:logoBici')) {
            attachments.push({
                filename: 'logoBici.png',
                path: path.join(process.cwd(), 'src/assets/logoBici.png'),
                cid: 'logoBici',
                contentDisposition: 'inline',
                contentTransferEncoding: 'base64',
            });
        }

        const mailOptions = {
            from: `"Bicicletero UBB" <${emailConfig.user}>`,
            to,
            subject,
            html,
            attachments,
        };

        await transporter.sendMail(mailOptions);
        console.log('Correo enviado correctamente a:', to);
        console.log(
            'Imágenes incluidas:',
            attachments.map((a) => a.filename)
        );
        return mailOptions;
    } catch (error) {
        console.error('Error enviando el correo:', error.message);
        throw new Error('Error enviando el correo: ' + error.message);
    }
};