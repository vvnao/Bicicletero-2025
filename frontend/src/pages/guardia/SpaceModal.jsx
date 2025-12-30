import React, { useEffect, useState, useCallback } from 'react';
import {
  getSpaceDetails,
  occupyWithoutReservation,
  occupyWithReservation,
  liberateSpace,
  getUserByRut,
} from '@services/spaces.service';
import '@styles/SpaceModal.css';
import {
  FiUser,
  FiClock,
  FiBattery,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
  FiSearch,
  FiLock,
  FiUnlock,
  FiCalendar,
  FiMail,
  FiHash,
  FiPackage,
  FiAlertTriangle,
  FiCreditCard,
  FiCheckSquare,
  FiArrowRight,
  FiHelpCircle,
} from 'react-icons/fi';

const SpaceModal = ({ spaceId, onClose }) => {
  const [spaceDetails, setSpaceDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [userRut, setUserRut] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [retrievalCode, setRetrievalCode] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [selectedBicycleId, setSelectedBicycleId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [hoursError, setHoursError] = useState('');

  const SPACE_STATUS = {
    LIBRE: 'Libre',
    RESERVADO: 'Reservado',
    OCUPADO: 'Ocupado',
    INFRACCION: 'Tiempo Excedido',
  };

  const STATUS_COLORS = {
    LIBRE: '#10b981',
    RESERVADO: '#f59e0b',
    OCUPADO: '#ef4444',
    INFRACCION: '#f97316',
  };

  const formatUserName = useCallback((user) => {
    if (!user) return 'No disponible';
    if (user.name) return user.name;
    if (user.names && user.lastName) return `${user.names} ${user.lastName}`;
    if (user.firstName && user.lastName)
      return `${user.firstName} ${user.lastName}`;
    return 'Nombre no disponible';
  }, []);

  //* función para formatear fecha y hora
  const formatDateTime = useCallback((dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  //* Función para formatear minutos de infracción
  const formatInfractionTime = useCallback((minutes) => {
    if (!minutes || minutes <= 0) return '0 minutos';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0 && mins > 0) return `${hours}h ${mins}min`;
    if (hours > 0) return `${hours}h`;
    return `${mins}min`;
  }, []);

  //* Cargar detalles del espacio
  useEffect(() => {
    const loadSpaceData = async () => {
      try {
        setIsLoadingDetails(true);
        const data = await getSpaceDetails(spaceId);

        if (data && data.status === SPACE_STATUS.INFRACCION && data.times) {
          const now = new Date();
          const infractionStart = new Date(data.times.infractionStart);
          const infractionMs = now - infractionStart;
          const infractionMinutes = Math.max(
            Math.floor(infractionMs / (1000 * 60)),
            0
          );
          data.times.infractionMinutes = infractionMinutes;
        }

        setSpaceDetails(data);
        setErrorMessage('');
      } catch (error) {
        console.error('Error al cargar detalles:', error);
        const errorMsg =
          error.response?.data?.message || error.message || 'Error desconocido';
        setErrorMessage(`Error al cargar detalles: ${errorMsg}`);
        setSpaceDetails(null);
      } finally {
        setIsLoadingDetails(false);
      }
    };
    loadSpaceData();
  }, [spaceId]);

  //* Buscar usuario por RUT
  const handleSearchUser = async () => {
    if (!userRut.trim()) {
      alert('Ingrese un RUT');
      return;
    }

    try {
      setIsProcessingAction(true);
      const userData = await getUserByRut(userRut.trim());
      setFoundUser(userData);
      setErrorMessage('');

      if (userData.bicycles?.length > 0) {
        setSelectedBicycleId(userData.bicycles[0].id.toString());
      } else {
        setErrorMessage('El usuario no tiene bicicletas registradas');
        setFoundUser(null);
      }
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      setFoundUser(null);
      setErrorMessage('Usuario no encontrado o error en la búsqueda');
    } finally {
      setIsProcessingAction(false);
    }
  };

  //* Ocupar espacio sin reserva
  const handleOccupyManual = async () => {
    if (!foundUser) {
      setHoursError('Debe buscar un usuario primero');
      return;
    }
    if (!selectedBicycleId) {
      setHoursError('Debe seleccionar una bicicleta');
      return;
    }
    if (!estimatedHours || estimatedHours.trim() === '') {
      setHoursError('Ingrese horas estimadas');
      return;
    }

    const hours = parseInt(estimatedHours);
    if (isNaN(hours) || hours < 1 || hours > 24) {
      setHoursError('Ingrese un número entero entre 1 y 24 horas');
      return;
    }
    if (parseFloat(estimatedHours) !== hours) {
      setHoursError('Solo se permiten números enteros (sin decimales)');
      return;
    }

    setHoursError('');

    try {
      setIsProcessingAction(true);
      await occupyWithoutReservation(spaceId, {
        rut: userRut.trim(),
        estimatedHours: hours,
        bicycleId: parseInt(selectedBicycleId),
      });
      alert('¡Ingreso manual registrado con éxito!');
      onClose();
    } catch (error) {
      console.error('Error al ocupar espacio:', error);
      alert(
        error.response?.data?.message ||
          error.message ||
          'Error al ocupar el espacio'
      );
    } finally {
      setIsProcessingAction(false);
    }
  };

  //* Confirmar reserva
  const handleOccupyReservation = async () => {
    if (!spaceDetails?.reservation?.code) {
      alert('Error: No hay código de reserva disponible');
      return;
    }

    const confirmed = window.confirm(
      `¿Confirmar ingreso para la reserva ${spaceDetails.reservation.code}?\n\n`
    );

    if (!confirmed) return;

    try {
      setIsProcessingAction(true);
      const result = await occupyWithReservation(spaceDetails.reservation.code);

      alert(`¡Reserva confirmada con éxito!\n\n`);
      onClose();
    } catch (error) {
      console.error('Error al confirmar reserva:', error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        'Error al confirmar la reserva';
      alert(
        `Error: ${errorMsg}\n\nVerifica que el código de reserva sea válido y esté activo.`
      );
    } finally {
      setIsProcessingAction(false);
    }
  };

  //* Liberar espacio
  const handleLiberateSpace = async () => {
    if (!retrievalCode.trim()) {
      alert('Ingrese el código de retiro');
      return;
    }

    try {
      setIsProcessingAction(true);
      await liberateSpace(spaceId, retrievalCode.trim());
      alert('¡Espacio liberado exitosamente!');
      onClose();
    } catch (error) {
      console.error('Error al liberar espacio:', error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        'Error al liberar el espacio';
      alert(`Código de retiro incorrecto`);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const isSpaceFree = spaceDetails?.status === SPACE_STATUS.LIBRE;
  const isSpaceOccupied = spaceDetails?.status === SPACE_STATUS.OCUPADO;
  const isSpaceReserved = spaceDetails?.status === SPACE_STATUS.RESERVADO;
  const isSpaceInInfraction = spaceDetails?.status === SPACE_STATUS.INFRACCION;

  if (isLoadingDetails) {
    return (
      <div className='space-modal-overlay'>
        <div className='space-modal-content loading-modal'>
          <div className='loading-spinner'></div>
          <p>Cargando información del espacio...</p>
        </div>
      </div>
    );
  }

  if (errorMessage && !spaceDetails) {
    return (
      <div className='space-modal-overlay'>
        <div className='space-modal-content error-modal'>
          <FiAlertTriangle className='error-icon' />
          <h3>Error</h3>
          <p className='error-text'>{errorMessage}</p>
          <div className='error-details'>
            <p>
              <small>Espacio ID: {spaceId}</small>
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

  if (!spaceDetails) {
    return (
      <div className='space-modal-overlay'>
        <div className='space-modal-content'>
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

  const isValidHours =
    estimatedHours &&
    !isNaN(parseInt(estimatedHours)) &&
    parseInt(estimatedHours) >= 1 &&
    parseInt(estimatedHours) <= 24 &&
    Number.isInteger(parseFloat(estimatedHours));

  return (
    <div
      className='space-modal-overlay'
      onClick={onClose}
    >
      <div
        className='space-modal-content'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        <header className='space-modal-header'>
          <div className='space-modal-header-content'>
            <h2 className='space-modal-title'>
              ESPACIO {spaceDetails.spaceCode}
              <span
                className='space-status-badge'
                style={{
                  backgroundColor:
                    STATUS_COLORS[
                      spaceDetails.status.replace(' ', '_').toUpperCase()
                    ] || '#6b7280',
                }}
              >
                {spaceDetails.status.toUpperCase()}
              </span>
            </h2>
          </div>
          <button
            className='space-modal-close'
            onClick={onClose}
            disabled={isProcessingAction}
          >
            <FiX />
          </button>
        </header>

        {/* Cuerpo del modal */}
        <div className='space-modal-body'>
          {/* ESPACIO LIBRE */}
          {isSpaceFree && (
            <div className='free-space-section'>
              <div className='section-header'>
                <FiCheckSquare className='section-icon' />
                <h3>Registro Manual de Ingreso</h3>
              </div>

              <div className='form-group'>
                <label className='form-label'>
                  <FiSearch className='label-icon' />
                  Buscar usuario por RUT
                </label>
                <div className='input-group'>
                  <input
                    type='text'
                    className='form-input'
                    value={userRut}
                    onChange={(e) => setUserRut(e.target.value)}
                    placeholder='19.157.881-3'
                    disabled={isProcessingAction}
                  />
                  <button
                    className='btn-search-user'
                    onClick={handleSearchUser}
                    disabled={isProcessingAction || !userRut.trim()}
                  >
                    <FiSearch />
                    {isProcessingAction ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>
              </div>

              {foundUser && (
                <div className='user-found-section'>
                  <div className='info-card'>
                    <div className='info-card-header'>
                      <FiUser className='card-icon' />
                      <h4>Usuario Encontrado</h4>
                    </div>
                    <div className='info-card-content'>
                      <p>
                        <strong>Nombre:</strong> {foundUser.name}
                      </p>
                      <p>
                        <strong>RUT:</strong> {foundUser.rut}
                      </p>

                      <div className='form-group'>
                        <label className='form-label'>
                          <FiBattery className='label-icon' />
                          Seleccionar Bicicleta
                        </label>
                        <select
                          className='form-select'
                          value={selectedBicycleId}
                          onChange={(e) => setSelectedBicycleId(e.target.value)}
                          disabled={isProcessingAction}
                        >
                          <option value=''>Seleccione una bicicleta</option>
                          {foundUser.bicycles.map((bicycle) => (
                            <option
                              key={bicycle.id}
                              value={bicycle.id}
                            >
                              {bicycle.brand} {bicycle.model} ({bicycle.color})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className='form-group'>
                <label className='form-label'>
                  <FiClock className='label-icon' />
                  Horas estimadas de estadía
                </label>
                <input
                  type='number'
                  className='form-input'
                  value={estimatedHours}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d+$/.test(value)) {
                      setEstimatedHours(value);
                    }
                  }}
                  min='1'
                  max='24'
                  placeholder='Ej: 4'
                  disabled={isProcessingAction}
                />
                <small className='form-help-text'>Máximo 24 horas</small>
              </div>

              <button
                className='btn-occupy-space'
                onClick={handleOccupyManual}
                disabled={
                  isProcessingAction ||
                  !foundUser ||
                  !selectedBicycleId ||
                  !isValidHours ||
                  !!hoursError
                }
              >
                <FiLock />
                {isProcessingAction ? 'Procesando...' : 'Marcar como Ocupado'}
              </button>
            </div>
          )}

          {/* ESPACIO OCUPADO O EN INFRACCIÓN */}
          {(isSpaceOccupied || isSpaceInInfraction) && (
            <div className='occupied-space-section'>
              <div className='section-header'>
                <FiAlertCircle className='section-icon' />
                <h3>Información del Espacio</h3>
              </div>

              {/* Información del usuario */}
              <div className='info-card'>
                <div className='info-card-header'>
                  <FiUser className='card-icon' />
                  <h4>Datos del Usuario</h4>
                </div>
                <div className='info-card-content'>
                  <p>
                    <strong>Nombre:</strong> {formatUserName(spaceDetails.user)}
                  </p>
                  <p>
                    <strong>RUT:</strong>{' '}
                    {spaceDetails.user?.rut || 'No disponible'}
                  </p>
                  {spaceDetails.user?.email && (
                    <p>
                      <strong>Email:</strong> {spaceDetails.user.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Registro de tiempos */}
              <div className='info-card'>
                <div className='info-card-header'>
                  <FiClock className='card-icon' />
                  <h4>Registro de Tiempos</h4>
                </div>
                <div className='info-card-content'>
                  <div className='time-row'>
                    <span className='time-label'>Fecha-Hora de Llegada:</span>
                    <span className='time-value'>
                      {formatDateTime(spaceDetails.times?.checkin)}
                    </span>
                  </div>
                  <div className='time-row'>
                    <span className='time-label'>
                      Fecha-Hora Estimada de Retiro:
                    </span>
                    <span className='time-value'>
                      {formatDateTime(spaceDetails.times?.estimatedCheckout)}
                    </span>
                  </div>

                  {isSpaceInInfraction && (
                    <div className='time-row infraction-row'>
                      <span className='time-label'>
                        <FiAlertTriangle className='infraction-icon' />
                        Tiempo en Infracción:
                      </span>
                      <span className='time-value infraction-time'>
                        {formatInfractionTime(
                          spaceDetails.times?.infractionMinutes || 0
                        )}
                      </span>
                    </div>
                  )}

                  {spaceDetails.times?.infractionStart && (
                    <div className='time-row'>
                      <span className='time-label'>Inicio de Infracción:</span>
                      <span className='time-value'>
                        {formatDateTime(spaceDetails.times.infractionStart)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de la bicicleta */}
              <div className='info-card'>
                <div className='info-card-header'>
                  <FiBattery className='card-icon' />
                  <h4>Datos de la Bicicleta</h4>
                </div>
                <div className='info-card-content'>
                  <p>
                    <strong>Marca:</strong>{' '}
                    {spaceDetails.bicycle?.brand || 'No disponible'}
                  </p>
                  <p>
                    <strong>Modelo:</strong>{' '}
                    {spaceDetails.bicycle?.model || 'No disponible'}
                  </p>
                  <p>
                    <strong>Color:</strong>{' '}
                    {spaceDetails.bicycle?.color || 'No disponible'}
                  </p>
                  {(spaceDetails.bicycle?.urlImage ||
                    spaceDetails.bicycle?.photo) && (
                    <div className='bicycle-image-container'>
                      <img
                        src={
                          spaceDetails.bicycle.urlImage ||
                          `/uploads/${spaceDetails.bicycle.photo}`
                        }
                        alt={`Bicicleta ${spaceDetails.bicycle.brand} ${spaceDetails.bicycle.model}`}
                        className='bicycle-image'
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Proceso de retiro */}
              <div className='action-section'>
                <div className='section-header'>
                  <FiUnlock className='section-icon' />
                  <h4>Proceso de Retiro</h4>
                </div>
                <div className='input-group'>
                  <input
                    type='text'
                    className='form-input'
                    placeholder='Ingrese código de retiro'
                    value={retrievalCode}
                    onChange={(e) => setRetrievalCode(e.target.value)}
                    disabled={isProcessingAction}
                  />
                  <button
                    className={`btn-liberate-space ${
                      isSpaceInInfraction ? 'infraction-btn' : ''
                    }`}
                    onClick={handleLiberateSpace}
                    disabled={isProcessingAction || !retrievalCode.trim()}
                  >
                    <FiArrowRight />
                    {isProcessingAction ? 'Procesando...' : 'Liberar Espacio'}
                  </button>
                </div>
                <small className='form-help-text'>
                  El código de retiro fue enviado al correo del usuario
                </small>

                {isSpaceInInfraction && (
                  <div className='infraction-alert'>
                    <FiAlertTriangle className='alert-icon' />
                    <p>
                      Este espacio ha excedido el tiempo estimado de estadía.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ESPACIO RESERVADO */}
          {isSpaceReserved && (
            <div className='reserved-space-section'>
              <div className='section-header'>
                <FiCalendar className='section-icon' />
                <h3>Reserva Pendiente</h3>
              </div>

              {!spaceDetails?.user?.rut ||
              !spaceDetails?.bicycle?.brand ||
              !spaceDetails?.reservation?.code ? (
                <div className='error-card'>
                  <FiAlertTriangle className='error-icon' />
                  <p>
                    No se pudo cargar la información completa de la reserva.
                  </p>
                  <p className='form-help-text'>
                    Verifica que el espacio tenga una reserva activa en el
                    sistema.
                  </p>
                </div>
              ) : (
                <>
                  {/* Información del usuario */}
                  <div className='info-card'>
                    <div className='info-card-header'>
                      <FiUser className='card-icon' />
                      <h4>Datos del Usuario</h4>
                    </div>
                    <div className='info-card-content'>
                      <p>
                        <strong>Nombre:</strong>{' '}
                        {formatUserName(spaceDetails.user)}
                      </p>
                      <p>
                        <strong>RUT:</strong> {spaceDetails.user.rut}
                      </p>
                      <p>
                        <strong>Email:</strong>{' '}
                        {spaceDetails.user.email || 'No disponible'}
                      </p>
                    </div>
                  </div>

                  {/* Información de la reserva */}
                  <div className='info-card'>
                    <div className='info-card-header'>
                      <FiPackage className='card-icon' />
                      <h4>Información de la Reserva</h4>
                    </div>
                    <div className='info-card-content'>
                      <p>
                        <strong>Horas Estimadas:</strong>{' '}
                        {spaceDetails.reservation.estimatedHours} horas
                      </p>
                      <div className='status-badge-container'>
                        <span className='status-label'>
                          <span className='status-label'>
                            <strong>Estado:</strong>
                          </span>
                        </span>
                        <span className='status-badge reservation-status'>
                          {spaceDetails.reservation.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Información de la bicicleta */}
                  <div className='info-card'>
                    <div className='info-card-header'>
                      <FiBattery className='card-icon' />
                      <h4>Bicicleta Reservada</h4>
                    </div>
                    <div className='info-card-content'>
                      <p>
                        <strong>Marca:</strong> {spaceDetails.bicycle.brand}
                      </p>
                      <p>
                        <strong>Modelo:</strong> {spaceDetails.bicycle.model}
                      </p>
                      <p>
                        <strong>Color:</strong> {spaceDetails.bicycle.color}
                      </p>
                      {(spaceDetails.bicycle.urlImage ||
                        spaceDetails.bicycle.photo) && (
                        <div className='bicycle-image-container'>
                          <img
                            src={
                              spaceDetails.bicycle.urlImage ||
                              `/uploads/${spaceDetails.bicycle.photo}`
                            }
                            alt={`Bicicleta ${spaceDetails.bicycle.brand} ${spaceDetails.bicycle.model}`}
                            className='bicycle-image'
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Confirmación de ingreso */}
                  <div className='confirmation-section'>
                    <div className='section-header'>
                      <FiCheckCircle className='section-icon' />
                      <h4>Confirmar Ingreso</h4>
                    </div>

                    <div className='code-verification'>
                      <p className='verification-label'>
                        <FiHash className='label-icon' />
                        Código a verificar:
                      </p>
                      <div className='verification-code-box'>
                        {spaceDetails.reservation.code}
                      </div>
                      <small className='form-help-text'>
                        Este código fue proporcionado al usuario al hacer la
                        reserva
                      </small>
                      <br />
                    </div>

                    <button
                      className='btn-confirm-reservation'
                      onClick={handleOccupyReservation}
                      disabled={isProcessingAction}
                    >
                      <FiCheckCircle />
                      {isProcessingAction
                        ? 'Confirmando...'
                        : 'Confirmar Ingreso de Reserva'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpaceModal;