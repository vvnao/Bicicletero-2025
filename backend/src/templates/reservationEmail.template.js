export const emailTemplates = {
    reservationConfirmation: (user, reservation) => {
        return `
        <h2>¡Reserva Confirmada!</h2>
        <p>Hola ${user.names},</p>
        <p>Tu reserva ha sido confirmada con los siguientes detalles:</p>
        <ul>
            <li><strong>Código de reserva:</strong> ${
            reservation.reservationCode
            }</li>
            <li><strong>Bicicletero:</strong> ${
            reservation.space.bikerack.name
            }</li>
            <li><strong>Espacio asignado:</strong> ${
            reservation.space.spaceCode
            }</li>
            <li><strong>Horas estimadas:</strong> ${
            reservation.estimatedHours
            } horas</li>
            <li><strong>Expira a las:</strong> ${reservation.expirationTime.toLocaleString()}</li>
        </ul>
        <p><strong>Importante:</strong> Debes presentarte antes de la hora de expiración.</p>
        `;
    },

    reservationCancellation: (user, reservation) => {
        return `
        <h2>Reserva Cancelada</h2>
        <p>Hola ${user.names},</p>
        <p>Tu reserva <strong>${reservation.reservationCode}</strong> ha sido cancelada.</p>
        <p>El espacio ${reservation.space.spaceCode} está ahora disponible para otros usuarios.</p>
        `;
    },
};