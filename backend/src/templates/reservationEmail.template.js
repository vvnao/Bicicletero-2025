export const emailTemplates = {
  //! email para la confirmación de reserva
  reservationConfirmation: (user, reservation) => {
    return `
      <h2>¡Reserva Confirmada!</h2>
      <p>Hola ${user.names},</p>
      <p>Tu reserva ha sido confirmada con los siguientes detalles:</p>
      <ul>
        <li><strong>Código de reserva:</strong> ${reservation.reservationCode}</li>
        <li><strong>Bicicletero:</strong> ${reservation.space.bikerack.name}</li>
        <li><strong>Espacio asignado:</strong> ${reservation.space.spaceCode}</li>
        <li><strong>Horas estimadas:</strong> ${reservation.estimatedHours} horas</li>
        <li><strong>Expira a las:</strong> ${reservation.expirationTimeChile} hrs</li>
      </ul>
      <p><strong>Importante:</strong> Debes presentarte antes de la hora de expiración.</p>
    `;
  },
  ///////////////////////////////////////////////////////////////////////////////////
  ///! email para la cancelación de reserva (el usuario la cancela)
  reservationCancellation: (user, reservation) => {
    return `
      <h2>Reserva Cancelada</h2>
      <p>Hola ${user.names},</p>
      <p>Tu reserva <strong>${reservation.reservationCode}</strong> ha sido cancelada.</p>
      <p>El espacio ${reservation.space.spaceCode} está ahora disponible para otros usuarios.</p>
    `;
  },
  ///////////////////////////////////////////////////////////////////////////////////
  //! email para la expiración de reserva (el sistema la expira)
  reservationExpired: (user, reservation) => {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reserva Expirada - Bicicletero UBB</title>
  <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { margin: 0; padding: 0; background-color: #ffffff; font-family: 'Public Sans', Arial, sans-serif; }
    .container { max-width: 500px; margin: 0 auto; background: #cf2323; border-radius: 8px; overflow: hidden; }
    .header { background: #ffffff; padding: 15px 20px 15px 50px; text-align: left; }
    .content { padding: 20px; background: #ffffff; }
    .title { font-family: 'Public Sans', sans-serif; font-weight: 700; font-size: 22px; color: #cf2323; text-align: left; margin: 0 0 10px 0; }
    .greeting { font-family: 'Public Sans', sans-serif; font-size: 16px; line-height: 1.4; text-align: left; margin: 15px 0; }
    .divider { height: 1px; background: #e0e0e0; margin: 20px 0; }
    .summary-title { font-family: 'Public Sans', sans-serif; font-size: 20px; text-align: center; margin: 20px 0 15px 0; }
    .summary-box { background: rgba(0, 74, 173, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #004aad; }
    .detail-row { margin-bottom: 12px; line-height: 1.4; }
    .detail-label { font-family: 'Public Sans', sans-serif; font-weight: 600; font-size: 15px; display: inline; }
    .detail-value { font-family: 'Public Sans', sans-serif; font-size: 15px; display: inline; }
    .footer { font-family: 'Public Sans', sans-serif; font-size: 14px; color: #b4b4b4; text-align: center; margin: 25px 0 15px 0; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center">
        <table class="container" width="500" cellpadding="0" cellspacing="0" border="0">
          <tr><td class="header"><img src="cid:header" alt="UBB" style="max-width: 80%;"></td></tr>
          <tr><td class="content">
              <h2 class="title">Reserva Expirada</h2>
              <div class="greeting">
                <p>Hola ${user.names},</p>
                <p>Te informamos que tu reserva ha expirado debido a que se cumplió el tiempo límite de 30 minutos para presentarte en el bicicletero.</p>
              </div>
              <div class="divider"></div>
              <h3 class="summary-title">Detalles de la reserva:</h3>
              <div class="summary-box">
                <div class="detail-row">
                  <span class="detail-label">Código:</span>
                  <span class="detail-value"> ${reservation.reservationCode}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Espacio que estaba asignado:</span>
                  <span class="detail-value"> ${reservation.space?.spaceCode}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Estado:</span>
                  <span class="detail-value"> Expirada (Espacio liberado)</span>
                </div>
              </div>
              <p style="font-size: 14px; color: #666; margin-top: 20px;">Si aún necesitas un espacio, puedes realizar una nueva reserva desde la aplicación.</p>
              <div class="footer"><p>Sistema de Bicicleteros UBB</p></div>
          </td></tr>
        </table>
    </td></tr>
  </table>
</body>
</html>`;
  },
};