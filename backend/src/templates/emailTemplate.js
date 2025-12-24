export function registrationEmailTemplate(name) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solicitud de Registro - Bicicletero UBB</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
    body {
        margin: 0;
        padding: 0;
        background-color: #f4f7fb;
        font-family: 'Public Sans', Arial, sans-serif;
    }

    .container {
        max-width: 500px;
        margin: 0 auto;
        background: #0056b3;
        border-radius: 8px;
        overflow: hidden;
    }

    .header {
        background: #ffffff;
        padding: 15px 20px 15px 50px;
        text-align: left;
    }

    .content {
        padding: 20px;
        background: #ffffff;
    }

    .title {
        font-weight: 700;
        font-size: 22px;
        color: #0056b3;
        margin: 0 0 10px 0;
    }

    .greeting {
        font-size: 16px;
        line-height: 1.4;
        margin: 10px 0 20px 0;
    }

    .info-box {
        background: rgba(0, 86, 179, 0.1);
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid #0056b3;
        margin-top: 15px;
    }

    .footer {
        font-family: 'Noto Sans KR', sans-serif;
        font-size: 14px;
        color: #b4b4b4;
        text-align: center;
        margin: 25px 0 15px 0;
    }

    @media only screen and (max-width: 500px) {
        .container { max-width: 100% !important; margin: 10px !important; }
        .content { padding: 15px !important; }
        .title { font-size: 20px !important; }
        .greeting { font-size: 15px !important; }
    }
    </style>
</head>

<body>
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
        <td align="center">
            <table class="container">
                <tr>
                    <td class="header">
                        <img src="cid:logoBici" alt="Bicicletero Universidad del Bío-Bío" style="max-width: 80%; height: auto;">
                    </td>
                </tr>
                <tr>
                    <td class="content">
                        <h2 class="title">¡Solicitud recibida!</h2>
                        <div class="greeting">
                            <p>Hola ${name},</p>
                            <p>Tu solicitud para usar el sistema de Bicicleteros UBB fue <strong>recibida exitosamente</strong>.</p>
                            <p>Está pendiente de aprobación y recibirás una notificación por correo una vez que un guardia revise tu solicitud.</p>
                        </div>
                        <div class="info-box">
                            <p>¡Gracias por tu interés en el sistema Bicicleteros UBB!</p>
                        </div>
                        <div class="footer">
                            <p>Sistema de Bicicleteros UBB</p>
                            <p>© ${new Date().getFullYear()} Bicicletero UBB — Universidad del Bío-Bío</p>
                        </div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    </table>
</body>
</html>
    `;
}
