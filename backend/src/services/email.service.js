import nodemailer from "nodemailer";
import path from "path"; 
import { emailConfig } from "../config/configEnv.js";

export const sendEmail = async (to, subject, text, html) => {
    try {
        const transporter = nodemailer.createTransport({
            service: emailConfig.service,
            auth: {
                user: emailConfig.user,
                pass: emailConfig.pass,
            },
        });

        const mailOptions = {
            from: `"Bicicletero UBB" <${emailConfig.user}>`,
            to,
            subject,
            html,
            attachments: [
                {
                    filename: "logoBici.png",
                    path: path.join(process.cwd(), "src/assets/logoBici.png"), 
                    cid: "logoBici" 
                }
            ],
        };

        await transporter.sendMail(mailOptions);
        console.log("Correo enviado correctamente a:", to);
        return mailOptions;
    } catch (error) {
        console.error("Error enviando el correo:", error.message);
        throw new Error("Error enviando el correo: " + error.message);
    }
};
