// controllers/spaceManagement.controller.js - Versión actualizada

//! MARCAR OCUPADO CON RESERVA
export async function occupyWithReservation(req, res) {
  try {
    const { reservationCode } = req.body;

    if (!reservationCode) {
      return handleErrorClient(res, 400, 'Código de reserva requerido');
    }

    const result = await occupySpaceWithReservation(reservationCode, req); // <-- Pasar req

    // Envío de email...
    
    handleSuccess(res, 200, 'Espacio ocupado exitosamente con reserva', result);
  } catch (error) {
    console.error('Error en occupyWithReservation:', error);
    handleErrorClient(res, 400, error.message);
  }
}

//! MARCAR OCUPADO SIN RESERVA
export async function occupyWithoutReservation(req, res) {
  try {
    const { spaceId } = req.params;
    const { rut, estimatedHours, bicycleId } = req.body;

    if (!spaceId || !rut || !estimatedHours) {
      return handleErrorClient(
        res,
        400,
        'SpaceId, rut y estimatedHours requeridos'
      );
    }

    const result = await occupySpaceWithoutReservation(
      parseInt(spaceId),
      rut,
      parseInt(estimatedHours),
      req, // <-- Pasar req
      bicycleId
    );

    // Envío de email...
    
    handleSuccess(res, 200, 'Espacio ocupado exitosamente sin reserva', result);
  } catch (error) {
    console.error('Error en occupyWithoutReservation:', error);
    handleErrorClient(res, 400, error.message);
  }
}

//! LIBERAR ESPACIO
export async function liberateSpaceController(req, res) {
  try {
    const { spaceId } = req.params;

    if (!spaceId) {
      return handleErrorClient(res, 400, 'SpaceId requerido');
    }

    const result = await liberateSpace(parseInt(spaceId), req); // <-- Pasar req

    // Envío de email...
    
    handleSuccess(res, 200, 'Espacio liberado exitosamente', result);
  } catch (error) {
    console.error('Error en liberateSpace:', error);
    handleErrorClient(res, 400, error.message);
  }
}

//! MARCAR COMO TIEMPO EXCEDIDO (nuevo controlador)
export async function markAsOverdue(req, res) {
  try {
    const { spaceId } = req.params;

    if (!spaceId) {
      return handleErrorClient(res, 400, 'SpaceId requerido');
    }

    const result = await markSpaceAsOverdue(parseInt(spaceId), req); // <-- Pasar req

    // Envío de email...
    
    handleSuccess(res, 200, 'Espacio marcado como tiempo excedido', result);
  } catch (error) {
    console.error('Error en markAsOverdue:', error);
    handleErrorClient(res, 400, error.message);
  }
}