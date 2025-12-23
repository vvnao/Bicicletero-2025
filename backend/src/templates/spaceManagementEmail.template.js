import { generateWithdrawalCode } from '../helpers/spaceManagementEmail.helper.js';

export const emailTemplates = {
  //! CORREO DE INGRESO ESTÁNDAR (para con y sin reserva)
  checkinStandard: (user, space, data) => {
    const withdrawalCode = generateWithdrawalCode();
    const hasReservation = data.reservationCode;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ingreso Confirmado - Bicicletero UBB</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      font-family: 'Public Sans', Arial, sans-serif;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    .container {
      max-width: 500px;
      margin: 0 auto;
      background: #cf2323;
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
      font-family: 'Public Sans', sans-serif;
      font-weight: 700;
      font-size: 22px;
      color: #0d870b;
      text-align: left;
      margin: 0 0 10px 0;
    }
    
    .greeting {
      font-family: 'Public Sans', sans-serif;
      font-size: 16px;
      line-height: 1.4;
      text-align: left;
      margin: 15px 0;
    }
    
    .code-section {
      text-align: center;
      margin: 20px 0;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 6px;
    }
    
    .code-label {
      font-family: 'Public Sans', sans-serif;
      font-size: 18px;
      margin-bottom: 8px;
    }
    
    .code {
      font-family: 'Public Sans', sans-serif;
      font-weight: 700;
      font-size: 24px;
      color: #1800ad;
      letter-spacing: 2px;
    }
    
    .divider {
      height: 1px;
      background: #e0e0e0;
      margin: 20px 0;
    }
    
    .summary-title {
      font-family: 'Public Sans', sans-serif;
      font-size: 20px;
      text-align: center;
      margin: 20px 0 15px 0;
    }
    
    .summary-box {
      background: rgba(0, 74, 173, 0.1);
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #004aad;
    }
    
    .detail-row {
      margin-bottom: 12px;
      line-height: 1.4;
    }
    
    .detail-label {
      font-family: 'Public Sans', sans-serif;
      font-weight: 600;
      font-size: 15px;
      display: inline;
    }
    
    .detail-value {
      font-family: 'Public Sans', sans-serif;
      font-size: 15px;
      display: inline;
    }
    
    .reminder {
      font-family: 'Public Sans', sans-serif;
      font-size: 16px;
      text-align: center;
      margin: 20px 0;
      padding: 10px;
      background: #fff9e6;
      border-radius: 6px;
      line-height: 1.4;
    }
    
    .footer {
      font-family: 'Noto Sans KR', sans-serif;
      font-size: 14px;
      color: #b4b4b4;
      text-align: center;
      margin: 25px 0 15px 0;
    }

    /* Responsividad para los celus */
    @media only screen and (max-width: 500px) {
      .container {
        max-width: 100% !important;
        margin: 10px !important;
      }
      
      .content {
        padding: 15px !important;
      }
      
      .title { font-size: 20px !important; }
      .greeting { font-size: 15px !important; }
      .code-label { font-size: 16px !important; }
      .code { font-size: 22px !important; }
      .summary-title { font-size: 18px !important; }
      .detail-label, .detail-value { font-size: 14px !important; }
      .reminder { font-size: 15px !important; }
      .footer { font-size: 13px !important; }
    }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table class="container" width="500" cellpadding="0" cellspacing="0" border="0">
          <!-- logo y título -->
          <tr>
            <td class="header">
              <img src="cid:header" alt="Bicicletero Universidad del Bío-Bío" style="max-width: 80%; height: auto;">
            </td>
          </tr>
          
          <!-- contenido principal -->
          <tr>
            <td class="content">
              <!-- título principal -->
              <h2 class="title">Ingreso Confirmado!</h2>
              
              <!-- saludo y mensaje inicial -->
              <div class="greeting">
                <p>¡Hola ${user.names} ${user.lastName}!</p>
                <p>Tu bicicleta ya está segura en nuestro bicicletero.<br>
                Hemos registrado tu ingreso exitosamente.</p>
              </div>
              
              <!-- código de retiro -->
              <div class="code-section">
                <p class="code-label">Tu código de retiro es:</p>
                <p class="code">${withdrawalCode}</p>
              </div>
              
              <!-- separador -->
              <div class="divider"></div>
              
              <!-- resumen del registro -->
              <h3 class="summary-title">Resumen de tu registro:</h3>
              
              <div class="summary-box">
                <div class="detail-row">
                  <span class="detail-label">Espacio asignado:</span>
                  <span class="detail-value"> ${space.spaceCode}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Bicicletero:</span>
                  <span class="detail-value"> ${
                    space.bikerack?.name || 'No especificado'
                  }</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Fecha y hora de ingreso:</span>
                  <span class="detail-value"> ${new Date().toLocaleString(
                    'es-CL'
                  )}</span>
                </div>
                  ${
                    hasReservation
                      ? `
                  <div class="detail-row">
                    <span class="detail-label">Código de reserva:</span>
                    <span class="detail-value"> ${data.reservationCode}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Tiempo de estadía estimado:</span>
                    <span class="detail-value"> ${data.estimatedHours} horas</span>
                  </div>
                  `
                      : `
                  <div class="detail-row">
                    <span class="detail-label">Tiempo de estadía estimado:</span>
                    <span class="detail-value"> ${data.estimatedHours} horas</span>
                  </div>
                  `
                  }
              </div>
              
              <!-- recordatorio de retiro -->
              <div class="reminder">
                <p>Recuerda retirar tu bicicleta antes del tiempo estimado.</p>
              </div>
              
              <!-- pie de página -->
              <div class="footer">
                <p>Sistema de Bicicleteros UBB</p>
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
  },
};
