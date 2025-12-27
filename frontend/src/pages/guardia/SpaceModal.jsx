import React, { useEffect, useState } from 'react';
import { getSpaceDetails } from '@services/spaces.service';
import {
  occupyWithoutReservation,
  occupyWithReservation,
  liberateSpace,
  getUserByRut,
} from '@services/spaces.service';
import '@styles/SpaceModal.css';

const SpaceModal = ({ spaceId, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rut, setRut] = useState('');
  const [hours, setHours] = useState('');
  const [retrievalCode, setRetrievalCode] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [selectedBicycleId, setSelectedBicycleId] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  //* para obtener el nombre completo del usuario
  const getUserFullName = (user) => {
    if (!user) return 'No disponible';

    if (user.name) return user.name;

    if (user.names && user.lastName) {
      return `${user.names} ${user.lastName}`;
    }

    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }

    return 'Nombre no disponible';
  };

  //* para formatear fecha
  const formatDateTime = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  //* para formatear minutos de infracción
  const formatInfractionTime = (minutes) => {
    if (!minutes || minutes <= 0) return '0 minutos';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}min`;
    }
  };

  //* cargar detalles del espacio
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log(`📡 Cargando espacio ID: ${spaceId}`);
        const data = await getSpaceDetails(spaceId);

        if (data && data.status === 'En Infracción' && data.times) {
          const now = new Date();
          const infractionStart = new Date(data.times.infractionStart);
          const infractionMs = now - infractionStart;
          const infractionMinutes = Math.max(
            Math.floor(infractionMs / (1000 * 60)),
            0
          );

          data.times.infractionMinutes = infractionMinutes;
        }

        setDetails(data);
        setError('');
      } catch (e) {
        console.error('Error al cargar detalles:', e);
        console.error('Error response:', e.response?.data);
        console.error('Error status:', e.response?.status);

        const errorMsg =
          e.response?.data?.message || e.message || 'Error desconocido';
        setError(`Error al cargar detalles: ${errorMsg}`);
        setDetails(null);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [spaceId]);

  const handleSearchUser = async () => {
    if (!rut.trim()) {
      alert('Ingrese un RUT');
      return;
    }

    try {
      setActionLoading(true);
      const user = await getUserByRut(rut.trim());
      setFoundUser(user);
      setError('');

      if (user.bicycles && user.bicycles.length > 0) {
        setSelectedBicycleId(user.bicycles[0].id.toString());
      } else {
        setError('El usuario no tiene bicicletas registradas');
        setFoundUser(null);
      }
    } catch (e) {
      console.error('Error al buscar usuario:', e);
      setFoundUser(null);
      setError('Usuario no encontrado o error en la búsqueda');
    } finally {
      setActionLoading(false);
    }
  };

  //* ocupar espacio sin reserva
  const handleOccupyManual = async () => {
    if (!foundUser) {
      alert('Debe buscar un usuario primero');
      return;
    }
    if (!selectedBicycleId) {
      alert('Debe seleccionar una bicicleta');
      return;
    }
    if (!hours || parseFloat(hours) <= 0) {
      alert('Ingrese horas estimadas válidas (mayor a 0)');
      return;
    }

    try {
      setActionLoading(true);
      await occupyWithoutReservation(spaceId, {
        rut: rut.trim(),
        estimatedHours: parseFloat(hours),
        bicycleId: parseInt(selectedBicycleId),
      });
      alert('¡Ingreso manual registrado con éxito!');
      onClose();
    } catch (e) {
      console.error('Error al ocupar espacio:', e);
      alert(
        e.response?.data?.message || e.message || 'Error al ocupar el espacio'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleOccupyReservation = async () => {
    if (!details?.reservation?.code) {
      alert('Error: No hay código de reserva disponible');
      return;
    }

    const confirmed = window.confirm(
      `¿Confirmar ingreso para la reserva ${details.reservation.code}?\n\n` +
        `Usuario: ${details.user?.name || 'No disponible'}\n` +
        `Esta acción cambiará el estado del espacio a OCUPADO.`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      const result = await occupyWithReservation(details.reservation.code);

      alert(
        `¡Reserva confirmada con éxito!\n\n` +
          `Código de retiro generado: ${result.retrievalCode || 'N/A'}\n` +
          `Se ha enviado un correo de confirmación al usuario.`
      );

      onClose();
    } catch (e) {
      console.error('Error al confirmar reserva:', e);

      const errorMessage =
        e.response?.data?.message ||
        e.message ||
        'Error al confirmar la reserva';

      alert(
        `Error: ${errorMessage}\n\nVerifica que el código de reserva sea válido y esté activo.`
      );
    } finally {
      setActionLoading(false);
    }
  };

  //* liberar espacio
  const handleLiberate = async () => {
    if (!retrievalCode.trim()) {
      alert('Ingrese el código de retiro');
      return;
    }

    try {
      setActionLoading(true);
      const result = await liberateSpace(spaceId, retrievalCode.trim());
      alert('¡Espacio liberado exitosamente!');
      onClose();
    } catch (e) {
      console.error('Error al liberar espacio:', e);
      console.error('Error response:', e.response?.data);
      console.error('Error message:', e.message);

      const errorMsg =
        e.response?.data?.message || e.message || 'Error al liberar el espacio';
      alert(
        `Error: ${errorMsg}\n\nVerifica:\n1. El código es correcto\n2. El espacio está ocupado/en infracción\n3. El código no ha expirado`
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='modal-overlay'>
        <div className='modal-content loading-modal'>
          <p>Cargando información del espacio...</p>
        </div>
      </div>
    );
  }

  if (error && !details) {
    return (
      <div className='modal-overlay'>
        <div className='modal-content error-modal'>
          <h3>Error</h3>
          <p>{error}</p>
          <div className='error-details'>
            <p>
              <small>Espacio ID: {spaceId}</small>
            </p>
            <p>
              <small>Intenta cerrar y abrir nuevamente</small>
            </p>
          </div>
          <button
            onClick={onClose}
            className='btn-close'
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className='modal-overlay'>
        <div className='modal-content'>
          <p>No se encontró información del espacio.</p>
          <button
            onClick={onClose}
            className='btn-close'
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const { space, user, bicycle, times, status, reservation } = details;
  const isFree = status === 'Libre';
  const isOccupied = status === 'Ocupado';
  const isReserved = status === 'Reservado';
  const isInfraction = status === 'Tiempo Excedido';

  return (
    <div
      className='modal-overlay'
      onClick={onClose}
    >
      <div
        className='modal-content'
        onClick={(e) => e.stopPropagation()}
      >
        <header className='modal-header'>
          <h2>
            ESPACIO {details.spaceCode}:{' '}
            <span
              className={`status-${status.toLowerCase().replace(' ', '-')}`}
            >
              {status.toUpperCase()}
            </span>
          </h2>
          <button
            className='close-btn'
            onClick={onClose}
            disabled={actionLoading}
          >
            ×
          </button>
        </header>

        {/* ESPACIO LIBRE */}
        {isFree && (
          <div className='modal-body'>
            <div className='form-section'>
              <h3>📝 Registro Manual de Ingreso</h3>

              <div className='form-group'>
                <label>🔍 Buscar usuario por RUT:</label>
                <div className='input-group'>
                  <input
                    type='text'
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                    placeholder='19.157.881-3'
                    disabled={actionLoading}
                  />
                  <button
                    onClick={handleSearchUser}
                    className='btn-search'
                    disabled={actionLoading || !rut.trim()}
                  >
                    {actionLoading ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>
              </div>

              {foundUser && (
                <div className='user-section'>
                  <div className='user-info-card'>
                    <h4>✅ Usuario Encontrado</h4>
                    <p>
                      <strong>Nombre:</strong> {foundUser.name}
                    </p>
                    <p>
                      <strong>RUT:</strong> {foundUser.rut}
                    </p>

                    <div className='form-group'>
                      <label>🚲 Seleccionar Bicicleta:</label>
                      <select
                        value={selectedBicycleId}
                        onChange={(e) => setSelectedBicycleId(e.target.value)}
                        className='bicycle-select'
                        disabled={actionLoading}
                      >
                        <option value=''>Seleccione una bicicleta</option>
                        {foundUser.bicycles.map((bici) => (
                          <option
                            key={bici.id}
                            value={bici.id}
                          >
                            {bici.brand} {bici.model} ({bici.color})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className='form-group'>
                <label>🕐 Horas estimadas de estadía:</label>
                <input
                  type='number'
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  min='1'
                  max='24'
                  placeholder='Ej: 4'
                  disabled={actionLoading}
                />
                <small className='help-text'>Máximo 24 horas</small>
              </div>

              <button
                onClick={handleOccupyManual}
                disabled={
                  actionLoading || !foundUser || !selectedBicycleId || !hours
                }
                className='btn-action btn-occupy'
              >
                {actionLoading ? 'Procesando...' : 'Marcar como Ocupado'}
              </button>
            </div>
          </div>
        )}

        {/* ESPACIO OCUPADO/EN INFRACCIÓN */}
        {(isOccupied || isInfraction) && (
          <div className='modal-body'>
            <div className='info-section'>
              <h3>📋 Información del Espacio</h3>

              <div className='info-card user-card'>
                <h4>👤 Datos del Usuario</h4>
                <div className='user-details'>
                  <p>
                    <strong>Nombre:</strong> {getUserFullName(user)}
                  </p>
                  <p>
                    <strong>RUT:</strong> {user?.rut || 'No disponible'}
                  </p>
                  {user?.email && (
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                  )}
                </div>
              </div>

              <div className='info-card time-card'>
                <h4>⏰ Registro de Tiempos</h4>
                <div className='time-details'>
                  <div className='time-row'>
                    <span className='time-label'>Fecha-Hora de Llegada:</span>
                    <span className='time-value'>
                      {formatDateTime(times?.checkin)}
                    </span>
                  </div>
                  <div className='time-row'>
                    <span className='time-label'>
                      Fecha-Hora Estimada de Retiro:
                    </span>
                    <span className='time-value'>
                      {formatDateTime(times?.estimatedCheckout)}
                    </span>
                  </div>

                  {isInfraction && (
                    <div className='time-row infraction-highlight'>
                      <span className='time-label'>
                        ⏰ Tiempo en Infracción:
                      </span>
                      <span className='time-value infraction-time'>
                        {formatInfractionTime(times?.infractionMinutes || 0)}
                      </span>
                    </div>
                  )}

                  {times?.infractionStart && (
                    <div className='time-row'>
                      <span className='time-label'>Inicio de Infracción:</span>
                      <span className='time-value'>
                        {formatDateTime(times.infractionStart)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sección bicicleta */}
              <div className='info-card bicycle-card'>
                <h4>🚲 Datos de la Bicicleta</h4>
                <div className='bicycle-details'>
                  <p>
                    <strong>Marca:</strong> {bicycle?.brand || 'No disponible'}
                  </p>
                  <p>
                    <strong>Modelo:</strong> {bicycle?.model || 'No disponible'}
                  </p>
                  <p>
                    <strong>Color:</strong> {bicycle?.color || 'No disponible'}
                  </p>

                  {/* Imagen bicicleta */}
                  {(bicycle?.urlImage || bicycle?.photo) && (
                    <div className='bicycle-image-container'>
                      <img
                        src={bicycle.urlImage || `/uploads/${bicycle.photo}`}
                        alt={`Bicicleta ${bicycle.brand} ${bicycle.model}`}
                        className='bicycle-image'
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* acción para liberar */}
              <div className='action-section'>
                <h4>🔓 Proceso de Retiro</h4>
                <div className='input-group'>
                  <input
                    type='text'
                    placeholder='Ingrese código de retiro'
                    value={retrievalCode}
                    onChange={(e) => setRetrievalCode(e.target.value)}
                    className='retrieval-input'
                    disabled={actionLoading}
                  />
                  <button
                    onClick={handleLiberate}
                    className={`btn-action btn-liberate ${
                      isInfraction ? 'infraction-btn' : ''
                    }`}
                    disabled={actionLoading || !retrievalCode.trim()}
                  >
                    {actionLoading ? 'Procesando...' : 'Liberar Espacio'}
                  </button>
                </div>
                <small className='help-text'>
                  El código de retiro fue enviado al correo del usuario
                  {isInfraction && ' - Este espacio se encuentra en infracción'}
                </small>

                {isInfraction && (
                  <div className='infraction-notice'>
                    <p>
                      ⚠️ Este espacio ha excedido el tiempo estimado de estadía.
                    </p>
                    <p>
                      Por favor, verifique el código de retiro con el usuario.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ESPACIO RESERVADO */}
        {isReserved && (
          <div className='modal-body'>
            <div className='info-section'>
              <h3>📅 Reserva Pendiente</h3>

              {!details?.user?.rut ||
              !details?.bicycle?.brand ||
              !details?.reservation?.code ? (
                <div className='error-card'>
                  <p>
                    ⚠️ No se pudo cargar la información completa de la reserva.
                  </p>
                  <p className='help-text'>
                    Verifica que el espacio tenga una reserva activa en el
                    sistema.
                  </p>
                  <div className='debug-info'>
                    <p>
                      <small>
                        Debug: user existe: {details?.user ? 'Sí' : 'No'}
                      </small>
                    </p>
                    <p>
                      <small>
                        Debug: bicycle existe: {details?.bicycle ? 'Sí' : 'No'}
                      </small>
                    </p>
                    <p>
                      <small>
                        Debug: reservation existe:{' '}
                        {details?.reservation ? 'Sí' : 'No'}
                      </small>
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className='info-card'>
                    <h4>👤 Datos del Usuario</h4>
                    <p>
                      <strong>Nombre:</strong>{' '}
                      {details.user.name ||
                        `${details.user.names} ${details.user.lastName}`}
                    </p>
                    <p>
                      <strong>RUT:</strong> {details.user.rut}
                    </p>
                    <p>
                      <strong>Email:</strong>{' '}
                      {details.user.email || 'No disponible'}
                    </p>
                  </div>

                  <div className='info-card'>
                    <h4>📋 Información de la Reserva</h4>
                    <p>
                      <strong>Código de Reserva:</strong>
                      <span className='reservation-code'>
                        {details.reservation.code}
                      </span>
                    </p>
                    <p>
                      <strong>Horas Estimadas:</strong>{' '}
                      {details.reservation.estimatedHours} horas
                    </p>
                    <p>
                      <strong>Estado:</strong>
                      <span
                        className={`status-badge ${details.reservation.status?.toLowerCase()}`}
                      >
                        {details.reservation.status}
                      </span>
                    </p>
                  </div>

                  <div className='info-card'>
                    <h4>🚲 Bicicleta Reservada</h4>
                    <p>
                      <strong>Marca:</strong> {details.bicycle.brand}
                    </p>
                    <p>
                      <strong>Modelo:</strong> {details.bicycle.model}
                    </p>
                    <p>
                      <strong>Color:</strong> {details.bicycle.color}
                    </p>
                    {(details.bicycle.urlImage || details.bicycle.photo) && (
                      <div className='bicycle-image-container'>
                        <img
                          src={
                            details.bicycle.urlImage ||
                            `/uploads/${details.bicycle.photo}`
                          }
                          alt={`Bicicleta ${details.bicycle.brand} ${details.bicycle.model}`}
                          className='bicycle-image'
                        />
                      </div>
                    )}
                  </div>

                  <div className='confirmation-section'>
                    <h4>✅ Confirmar Ingreso</h4>
                    <p className='help-text'>
                      Confirme el ingreso cuando el usuario llegue con la
                      bicicleta. Se generará un código de retiro
                      automáticamente.
                    </p>

                    <button
                      onClick={handleOccupyReservation}
                      className='btn-action btn-confirm-reservation'
                      disabled={actionLoading}
                    >
                      {actionLoading
                        ? 'Confirmando...'
                        : 'Confirmar Ingreso de Reserva'}
                    </button>

                    <div className='reservation-code-display'>
                      <p>
                        <strong>Código a verificar:</strong>
                      </p>
                      <div className='code-box'>{details.reservation.code}</div>
                      <small className='help-text'>
                        Este código fue proporcionado al usuario al hacer la
                        reserva
                      </small>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <footer className='modal-footer'>
          <p className='legend'>
            <span className='legend-item free'>🟢 Libre</span>
            <span className='legend-item reserved'>🟡 Reservado</span>
            <span className='legend-item occupied'>🔴 Ocupado</span>
            <span className='legend-item infraction'>🟠 En Infracción</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default SpaceModal;
