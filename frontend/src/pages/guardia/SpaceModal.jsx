import React, { useEffect, useState } from 'react';
import { getSpaceDetails } from '@services/spaces.service';
import {
  occupyWithoutReservation,
  occupyWithReservation,
  liberateSpace,
  getUserByRut,
} from '@services/spaces.service';
import '@styles/SpaceModal.css';

import {
  X,
  Loader2,
  Search,
  User,
  Bike,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  FileText,
  Lock,
  Unlock,
  Mail,
  Hash,
  ShieldAlert,
  ShieldCheck,
  CalendarCheck,
  ClipboardCheck,
  UserCheck,
  Tag,
} from 'lucide-react';

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
    setError('');
    setFoundUser(null);

    const rutInput = rut.trim();

    if (!rutInput) {
      setError('Ingrese un RUT para buscar');
      return;
    }

    const rutRegex = /^(\d{1,2}\.\d{3}\.\d{3}-[\dkK]|\d{7,8}-[\dkK])$/i;
    if (!rutRegex.test(rutInput)) {
      const errorMsg = 'Formato inválido. Use: 12.345.678-9 o 12345678-9';
      setError(errorMsg);
      alert(errorMsg);
      return;
    }

    try {
      setActionLoading(true);
      const user = await getUserByRut(rutInput);

      if (user && user.id) {
        setFoundUser(user);
        if (user.bicycles && user.bicycles.length > 0) {
          setSelectedBicycleId(user.bicycles[0].id.toString());
        }
      } else {
        const errorMsg = 'Usuario no se encuentra registrado';
        setError(errorMsg);
        alert(errorMsg);
      }
    } catch (e) {
      console.error('Error al buscar usuario:', e);
      let errorMessage = 'Usuario no se encuentra registrado';

      const errorText = e.message?.toLowerCase() || '';
      if (
        errorText.includes('network') ||
        errorText.includes('conexión') ||
        errorText.includes('internet') ||
        e.code === 'ERR_NETWORK'
      ) {
        errorMessage = 'Error de conexión. Verifique su internet.';
      }

      setError(errorMessage);
      alert(errorMessage);
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

    if (!hours.trim()) {
      alert('Ingrese las horas estimadas de estadía');
      return;
    }

    if (!/^\d+$/.test(hours)) {
      alert('Hora inválida, debe ser un número entero entre 1 y 24');
      return;
    }

    const hoursNum = parseInt(hours);

    if (hoursNum < 1 || hoursNum > 24) {
      alert('Hora inválida, debe ser un número entero entre 1 y 24');
      return;
    }

    try {
      setActionLoading(true);
      await occupyWithoutReservation(spaceId, {
        rut: rut.trim(),
        estimatedHours: hoursNum,
        bicycleId: parseInt(selectedBicycleId),
      });
      alert('¡Ingreso registrado con éxito!');
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
      `¿Confirmar ingreso para la reserva ${details.reservation.code}?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      await occupyWithReservation(details.reservation.code);
      alert('¡Reserva confirmada con éxito!');
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
      await liberateSpace(spaceId, retrievalCode.trim());
      alert('¡Espacio liberado exitosamente!');
      onClose();
    } catch (e) {
      console.error('Error al liberar espacio:', e);
      const errorMsg =
        e.response?.data?.message || e.message || 'Error al liberar el espacio';
      alert(`Código de retiro inválido`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='modal-overlay'>
        <div className='modal-content loading-modal'>
          <Loader2
            className='loading-spinner'
            size={40}
          />
          <p>Cargando información del espacio...</p>
        </div>
      </div>
    );
  }

  if (error && !details) {
    return (
      <div className='modal-overlay'>
        <div className='modal-content error-modal'>
          <AlertCircle
            size={48}
            color='var(--mon-danger)'
          />
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
          <AlertCircle
            size={48}
            color='var(--mon-warning)'
          />
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
            <Tag
              size={20}
              style={{ marginRight: '10px' }}
            />
            ESPACIO {details.spaceCode}:{' '}
            <span
              className={`status-badge status-${status
                .toLowerCase()
                .replace(' ', '-')}`}
            >
              {status.toUpperCase()}
            </span>
          </h2>
          <button
            className='close-btn'
            onClick={onClose}
            disabled={actionLoading}
          >
            <X size={20} />
          </button>
        </header>

        {/* ESPACIO LIBRE */}
        {isFree && (
          <div className='modal-body'>
            <div className='form-section'>
              <h3 className='section-title'>
                <FileText size={18} />
                Registro Manual de Ingreso
              </h3>

              <div className='form-group'>
                <label>
                  <Search
                    size={16}
                    style={{ marginRight: '8px' }}
                  />
                  Buscar usuario por RUT:
                </label>
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
                    {actionLoading ? (
                      <>
                        <Loader2
                          size={16}
                          className='loading-spinner'
                        />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search size={16} />
                        Buscar
                      </>
                    )}
                  </button>
                </div>
              </div>

              {foundUser && (
                <div className='user-section'>
                  <div className='user-info-card'>
                    <h4>
                      <UserCheck size={18} />
                      Usuario Encontrado
                    </h4>
                    <p>
                      <strong>Nombre:</strong> {foundUser.name}
                    </p>
                    <p>
                      <strong>RUT:</strong> {foundUser.rut}
                    </p>

                    <div className='form-group'>
                      <label>
                        <Bike
                          size={16}
                          style={{ marginRight: '8px' }}
                        />
                        Seleccionar Bicicleta:
                      </label>
                      <select
                        value={selectedBicycleId}
                        onChange={(e) => setSelectedBicycleId(e.target.value)}
                        className='bicycle-select'
                        disabled={actionLoading}
                      >
                        <option value=''>Seleccione una bicicleta</option>
                        {foundUser.bicycles?.map((bici) => (
                          <option
                            key={bici.id}
                            value={bici.id}
                          >
                            {bici.brand} {bici.model} ({bici.color})
                          </option>
                        ))}
                      </select>
                      <div className='help-text'>
                        {foundUser.bicycles?.length === 0
                          ? 'Usuario sin bicicletas registradas'
                          : `${
                              foundUser.bicycles?.length || 0
                            } bicicleta(s) disponible(s)`}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className='form-group'>
                <label>
                  <Clock
                    size={16}
                    style={{ marginRight: '8px' }}
                  />
                  Horas estimadas de estadía:
                </label>
                <input
                  type='number'
                  value={hours}
                  onChange={(e) => {
                    const value = e.target.value;
                    const cleanValue = value.replace(/[eE+-.]/g, '');
                    if (cleanValue === '' || /^\d+$/.test(cleanValue)) {
                      const num = parseInt(cleanValue);
                      if (cleanValue === '' || (num >= 1 && num <= 24)) {
                        setHours(cleanValue);
                      }
                    }
                  }}
                  min='1'
                  max='24'
                  placeholder='Ej: 4'
                  disabled={actionLoading}
                />
                <small className='help-text'>
                  Máximo 24 horas (solo números enteros)
                </small>
              </div>

              <button
                onClick={handleOccupyManual}
                disabled={
                  actionLoading || !foundUser || !selectedBicycleId || !hours
                }
                className='btn-action btn-occupy'
              >
                {actionLoading ? (
                  <>
                    <Loader2
                      size={16}
                      className='loading-spinner'
                    />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Marcar como Ocupado
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ESPACIO OCUPADO/EN INFRACCIÓN */}
        {(isOccupied || isInfraction) && (
          <div className='modal-body'>
            <div className='info-section'>
              <h3 className='section-title'>
                <FileText size={18} />
                Información del Espacio
              </h3>

              <div className='info-card user-card'>
                <h4>
                  <User size={18} />
                  Datos del Usuario
                </h4>
                <div className='user-details'>
                  <div className='detail-row'>
                    <strong>Nombre:</strong>
                    <span>{getUserFullName(user)}</span>
                  </div>
                  <div className='detail-row'>
                    <strong>RUT:</strong>
                    <span>{user?.rut || 'No disponible'}</span>
                  </div>
                </div>
              </div>

              <div className='info-card time-card'>
                <h4>
                  <Clock size={18} />
                  Registro de Tiempos
                </h4>
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
                      <span className='time-label'>Tiempo en Infracción:</span>
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
                <h4>
                  <Bike size={18} />
                  Datos de la Bicicleta
                </h4>
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
                <h4>
                  <Unlock size={18} />
                  Proceso de Retiro
                </h4>
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
                    {actionLoading ? (
                      <>
                        <Loader2
                          size={16}
                          className='loading-spinner'
                        />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Unlock size={16} />
                        Liberar Espacio
                      </>
                    )}
                  </button>
                </div>
                <small className='help-text'>
                  <Mail
                    size={14}
                    style={{ marginRight: '6px', verticalAlign: 'middle' }}
                  />
                  El código de retiro fue enviado al correo del usuario
                </small>

                {isInfraction && (
                  <div className='infraction-notice'>
                    <AlertCircle
                      size={16}
                      style={{ marginRight: '8px', verticalAlign: 'middle' }}
                    />
                    <p>
                      Este espacio ha excedido el tiempo estimado de estadía.
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
              <h3 className='section-title'>
                <Calendar size={18} />
                Reserva Pendiente
              </h3>

              {!details?.user?.rut ||
              !details?.bicycle?.brand ||
              !details?.reservation?.code ? (
                <div className='error-card'>
                  <AlertCircle
                    size={20}
                    style={{ marginRight: '8px', verticalAlign: 'middle' }}
                  />
                  <p>
                    No se pudo cargar la información completa de la reserva.
                  </p>
                  <p className='help-text'>
                    Verifica que el espacio tenga una reserva activa en el
                    sistema.
                  </p>
                </div>
              ) : (
                <>
                  <div className='info-card'>
                    <h4>
                      <User size={18} />
                      Datos del Usuario
                    </h4>
                    <div className='detail-row'>
                      <strong>Nombre:</strong>
                      <span>
                        {details.user.name ||
                          `${details.user.names} ${details.user.lastName}`}
                      </span>
                    </div>
                    <div className='detail-row'>
                      <strong>RUT:</strong>
                      <span>{details.user.rut}</span>
                    </div>
                    <div className='detail-row'>
                      <strong>Email:</strong>
                      <span>{details.user.email || 'No disponible'}</span>
                    </div>
                  </div>

                  <div className='info-card'>
                    <h4>
                      <ClipboardCheck size={18} />
                      Información de la Reserva
                    </h4>
                    <div className='detail-row'>
                      <strong>Horas Estimadas:</strong>
                      <span>{details.reservation.estimatedHours} horas</span>
                    </div>
                    <div className='detail-row'>
                      <strong>Estado:</strong>
                      <span
                        className={`status-badge ${details.reservation.status?.toLowerCase()}`}
                      >
                        {details.reservation.status}
                      </span>
                    </div>
                  </div>

                  <div className='info-card'>
                    <h4>
                      <Bike size={18} />
                      Bicicleta Reservada
                    </h4>
                    <div className='detail-row'>
                      <strong>Marca:</strong>
                      <span>{details.bicycle.brand}</span>
                    </div>
                    <div className='detail-row'>
                      <strong>Modelo:</strong>
                      <span>{details.bicycle.model}</span>
                    </div>
                    <div className='detail-row'>
                      <strong>Color:</strong>
                      <span>{details.bicycle.color}</span>
                    </div>

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
                    <h4>
                      <CalendarCheck size={18} />
                      Confirmar Ingreso
                    </h4>
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
                      {actionLoading ? (
                        <>
                          <Loader2
                            size={16}
                            className='loading-spinner'
                          />
                          Confirmando...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={16} />
                          Confirmar Ingreso de Reserva
                        </>
                      )}
                    </button>

                    <div className='reservation-code-display'>
                      <p>
                        <strong>Código a verificar:</strong>
                      </p>
                      <div className='code-box'>
                        <Hash
                          size={20}
                          style={{
                            marginRight: '8px',
                            verticalAlign: 'middle',
                          }}
                        />
                        {details.reservation.code}
                      </div>
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
            <span className='legend-item free'>
              <div className='legend-dot free'></div>
              Libre
            </span>
            <span className='legend-item reserved'>
              <div className='legend-dot reserved'></div>
              Reservado
            </span>
            <span className='legend-item occupied'>
              <div className='legend-dot occupied'></div>
              Ocupado
            </span>
            <span className='legend-item infraction'>
              <div className='legend-dot infraction'></div>
              En Infracción
            </span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default SpaceModal;