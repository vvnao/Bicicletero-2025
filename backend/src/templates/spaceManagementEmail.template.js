export const emailTemplates = {
  //! CORREO DE INGRESO CON RESERVA (occupyWithReservation)
  checkinWithReservation: (user, space, reservation) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <img src="cid:logoBici" alt="Logo Bicicletero UBB" style="max-width: 150px; margin-bottom: 20px;">
      <h2 style="color: #2E8B57;">Ingreso Confirmado - Con Reserva</h2>
      <p>Hola <strong>${user.names}</strong>,</p>
      <p>Tu bicicleta ha sido registrada exitosamente en el sistema.</p>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3 style="margin-top: 0;">Detalles de tu ingreso:</h3>
        <p><strong>Espacio:</strong> ${space.spaceCode}</p>
        <p><strong>Bicicletero:</strong> ${
          space.bikerack?.name || 'No especificado'
        }</p>
        <p><strong>Hora de ingreso:</strong> ${new Date().toLocaleString(
          'es-CL'
        )}</p>
        <p><strong>Código de reserva:</strong> ${
          reservation.reservationCode
        }</p>
      </div>
      
      <p>Recuerda retirar tu bicicleta antes del tiempo estimado.</p>
      <p style="color: #666; font-size: 14px;">Sistema de Bicicleteros UBB</p>
    </div>
  `,

  //! CORREO DE INGRESO SIN RESERVA (occupyWithoutReservation)
  checkinWithoutReservation: (user, space, estimatedHours) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <img src="cid:logoBici" alt="Logo Bicicletero UBB" style="max-width: 150px; margin-bottom: 20px;">
      <h2 style="color: #2E8B57;">Ingreso Confirmado - Sin Reserva</h2>
      <p>Hola <strong>${user.names}</strong>,</p>
      <p>Tu bicicleta ha sido registrada exitosamente en el sistema.</p>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3 style="margin-top: 0;">Detalles de tu ingreso:</h3>
        <p><strong>Espacio:</strong> ${space.spaceCode}</p>
        <p><strong>Bicicletero:</strong> ${
          space.bikerack?.name || 'No especificado'
        }</p>
        <p><strong>Hora de ingreso:</strong> ${new Date().toLocaleString(
          'es-CL'
        )}</p>
        <p><strong>Tiempo estimado:</strong> ${estimatedHours} horas</p>
      </div>
      
      <p>Recuerda retirar tu bicicleta antes del tiempo estimado.</p>
      <p style="color: #666; font-size: 14px;">Sistema de Bicicleteros UBB</p>
    </div>
  `,

  //! CORREO DE RETIRO BICICLETA (liberateSpaceController)
  checkout: (user, space, reservation) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <img src="cid:logoBici" alt="Logo Bicicletero UBB" style="max-width: 150px; margin-bottom: 20px;">
      <h2 style="color: #2E8B57;">Retiro Confirmado</h2>
      <p>Hola <strong>${user.names}</strong>,</p>
      <p>Tu bicicleta ha sido retirada exitosamente del sistema.</p>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3 style="margin-top: 0;">Detalles de tu retiro:</h3>
        <p><strong>Espacio:</strong> ${space.spaceCode}</p>
        <p><strong>Bicicletero:</strong> ${
          space.bikerack?.name || 'No especificado'
        }</p>
        <p><strong>Hora de retiro:</strong> ${new Date().toLocaleString(
          'es-CL'
        )}</p>
        ${
          reservation
            ? `<p><strong>Tiempo total:</strong> ${calculateDuration(
                reservation.dateTimeActualArrival,
                new Date()
              )}</p>`
            : ''
        }
      </div>
      
      <p>¡Gracias por usar nuestro servicio!</p>
      <p style="color: #666; font-size: 14px;">Sistema de Bicicleteros UBB</p>
    </div>
  `,
};  

////////////////////////////////////////////////////////////////////////////////////////////////

//* para calcular duración
const calculateDuration = (start, end) => {
  const diffMs = end - new Date(start);
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};
