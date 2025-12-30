import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Tag,
  User,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Info,
  Shield,
  FileImage,
  UserCheck,
  UserX,
} from 'lucide-react';
import '@styles/IncidentDetailsModal.css';
import { ensureImageUrl } from '../../helpers/imageUrl';

const IncidentDetailsModal = ({ incidence, onClose }) => {
  const [loadingModal, setLoadingModal] = useState(false);
  const [currentModalImageIndex, setCurrentModalImageIndex] = useState(0);
  const [modalImageError, setModalImageError] = useState(false);

  //! obtener url imagen
  const getImageUrls = () => {
    //! primero verifica si hay evidencia
    if (incidence?.evidences && incidence.evidences.length > 0) {
      return incidence.evidences.map((evidence) => {
        return ensureImageUrl(evidence.url);
      });
    }

    if (incidence?.evidenceUrl) {
      return [ensureImageUrl(incidence.evidenceUrl)];
    }
    return [];
  };

  const images = getImageUrls();

  const nextModalImage = () => {
    if (images.length > 1) {
      setCurrentModalImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevModalImage = () => {
    if (images.length > 1) {
      setCurrentModalImageIndex(
        (prev) => (prev - 1 + images.length) % images.length
      );
    }
  };

  const handleModalOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    if (incidence) {
      console.log('DEBUG - Incidence object:', incidence);
      console.log('DEBUG - dateTimeReport:', incidence.dateTimeReport);
      console.log(
        'DEBUG - typeof dateTimeReport:',
        typeof incidence.dateTimeReport
      );
      console.log('DEBUG - dateTimeIncident:', incidence.dateTimeIncident);
      console.log(
        'DEBUG - typeof dateTimeIncident:',
        typeof incidence.dateTimeIncident
      );
    }
  }, [incidence]);

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  const formatModalDateTime = (dateInput) => {
    if (
      !dateInput ||
      (typeof dateInput === 'object' && Object.keys(dateInput).length === 0)
    ) {
      return 'No especificada';
    }

    console.log('DEBUG dateInput:', dateInput);
    console.log('DEBUG typeof dateInput:', typeof dateInput);

    try {
      if (
        typeof dateInput === 'object' &&
        Object.keys(dateInput).length === 0
      ) {
        return 'Fecha no disponible';
      }

      let date;

      if (dateInput.formatted) {
        const formatted = dateInput.formatted;
        const [datePart, timePart] = formatted.split(', ');
        const [month, day, year] = datePart.split('/');
        const [time] = timePart.split(' ');
        const [hours, minutes] = time.split(':');

        return `${day.padStart(2, '0')}/${month.padStart(
          2,
          '0'
        )}/${year} ${hours.padStart(2, '0')}:${minutes}`;
      }

      if (typeof dateInput === 'string') {
        date = new Date(dateInput);
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else if (typeof dateInput === 'object') {
        if (dateInput._seconds) {
          date = new Date(dateInput._seconds * 1000);
        } else if (dateInput.toISOString) {
          date = new Date(dateInput.toISOString());
        } else {
          date = new Date(JSON.stringify(dateInput));
        }
      }

      if (!date || isNaN(date.getTime())) {
        console.log('DEBUG - No se pudo parsear la fecha:', dateInput);
        return 'Fecha no disponible';
      }

      return `${date.getDate().toString().padStart(2, '0')}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}/${date.getFullYear()} ${date
        .getHours()
        .toString()
        .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error formateando fecha:', error, 'dateInput:', dateInput);
      return 'Fecha no disponible';
    }
  };

  const getModalSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'alta':
        return (
          <AlertCircle className='modal-severity-icon modal-severity-high' />
        );
      case 'media':
        return (
          <AlertTriangle className='modal-severity-icon modal-severity-medium' />
        );
      case 'baja':
        return <Info className='modal-severity-icon modal-severity-low' />;
      default:
        return <Info className='modal-severity-icon' />;
    }
  };

  const getModalStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'abierta':
        return <AlertCircle className='modal-status-icon modal-status-open' />;
      case 'en proceso':
        return <Clock className='modal-status-icon modal-status-process' />;
      case 'resuelta':
        return (
          <CheckCircle className='modal-status-icon modal-status-resolved' />
        );
      case 'cerrada':
        return (
          <CheckCircle className='modal-status-icon modal-status-closed' />
        );
      default:
        return <Info className='modal-status-icon' />;
    }
  };

  if (!incidence) return null;

  return (
    <div
      className='modal-main-overlay'
      onClick={handleModalOverlayClick}
    >
      <div
        className='modal-main-content'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado del Modal */}
        <div className='modal-main-header'>
          <div className='modal-header-content'>
            <Shield className='modal-header-icon' />
            <h2 className='modal-title'>
              Detalles del Reporte #
              {incidence?.id?.toString().padStart(3, '0') || '000'}
            </h2>
          </div>
          <button
            className='modal-close-button'
            onClick={onClose}
            disabled={loadingModal}
            aria-label='Cerrar modal'
          >
            <X className='modal-close-icon' />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className='modal-main-body'>
          {/*información General */}
          <div className='modal-info-section'>
            <h3 className='modal-section-title'>
              <Info className='modal-section-icon' />
              INFORMACIÓN GENERAL
            </h3>
            <div className='modal-info-grid'>
              <div className='modal-info-item'>
                <span className='modal-info-label'>ID del Reporte:</span>
                <span className='modal-info-value'>
                  #{incidence?.id?.toString().padStart(3, '0') || '000'}
                </span>
              </div>

              <div className='modal-info-item'>
                <span className='modal-info-label'>Reportado por:</span>
                <span className='modal-info-value'>
                  {incidence?.reporter?.names || 'Guardia'}{' '}
                  {incidence?.reporter?.lastName || ''}
                </span>
              </div>

              <div className='modal-info-item'>
                <span className='modal-info-label'>Fecha de creación:</span>
                <span className='modal-info-value'>
                  <Clock className='modal-inline-icon' />
                  {console.log(
                    'DEBUG incidence?.dateTimeReport:',
                    incidence?.dateTimeReport
                  )}
                  {formatModalDateTime(incidence?.dateTimeReport)}
                </span>
              </div>

              <div className='modal-info-item'>
                <span className='modal-info-label'>Estado actual:</span>
                <span
                  className={`modal-info-value modal-status-badge modal-status-${(
                    incidence?.status || 'Abierta'
                  )
                    .toLowerCase()
                    .replace(/\s+/g, '-')}`}
                >
                  {getModalStatusIcon(incidence?.status)}
                  {incidence?.status || 'Abierta'}
                </span>
              </div>
            </div>
          </div>

          {/*Fecha y Hora del Incidente */}
          <div className='modal-detail-section'>
            <h3 className='modal-section-title'>
              <Calendar className='modal-section-icon' />
              FECHA Y HORA DEL INCIDENTE
            </h3>
            <div className='modal-detail-value'>
              <Clock className='modal-inline-icon' />
              {console.log(
                'DEBUG incidence?.dateTimeIncident:',
                incidence?.dateTimeIncident
              )}
              {formatModalDateTime(incidence?.dateTimeIncident)}
            </div>
          </div>

          {/* Ubicación */}
          <div className='modal-detail-section'>
            <h3 className='modal-section-title'>
              <MapPin className='modal-section-icon' />
              UBICACIÓN
            </h3>
            <div className='modal-form-row'>
              <div className='modal-form-group'>
                <label className='modal-form-label'>Bicicletero</label>
                <div className='modal-detail-value'>
                  <MapPin className='modal-inline-icon' />
                  {incidence?.bikerack?.name || 'No especificado'}
                </div>
              </div>

              <div className='modal-form-group'>
                <label className='modal-form-label'>
                  {incidence?.space ? 'Espacio asignado' : 'Espacio (Opcional)'}
                </label>
                <div className='modal-detail-value'>
                  {incidence?.space?.spaceCode ||
                    incidence?.space?.code ||
                    incidence?.space?.name ||
                    'No especificado'}
                </div>
              </div>
            </div>
          </div>

          {/* Clasificación */}
          <div className='modal-detail-section'>
            <h3 className='modal-section-title'>
              <Tag className='modal-section-icon' />
              CLASIFICACIÓN
            </h3>
            <div className='modal-form-row'>
              <div className='modal-form-group'>
                <label className='modal-form-label'>Tipo de Incidencia</label>
                <div className='modal-detail-value modal-type-badge'>
                  <Tag className='modal-inline-icon' />
                  {incidence?.incidenceType || 'No especificado'}
                </div>
              </div>

              <div className='modal-form-group'>
                <label className='modal-form-label'>Gravedad</label>
                <div className='modal-detail-value modal-severity-badge'>
                  {getModalSeverityIcon(incidence?.severity)}
                  {incidence?.severity || 'No especificada'}
                </div>
              </div>
            </div>
          </div>

          {/*  Usuario Involucrado */}
          <div className='modal-detail-section'>
            <h3 className='modal-section-title'>
              <User className='modal-section-icon' />
              USUARIO INVOLUCRADO
            </h3>
            <div className='modal-user-info-display'>
              {incidence?.involvedUser ? (
                <>
                  <div className='modal-user-detail'>
                    <UserCheck className='modal-user-icon' />
                    <div className='modal-user-content'>
                      <span className='modal-user-label'>Nombre:</span>
                      <span className='modal-user-value'>
                        {incidence.involvedUser.names}{' '}
                        {incidence.involvedUser.lastName}
                      </span>
                    </div>
                  </div>

                  <div className='modal-user-detail'>
                    <User className='modal-user-icon' />
                    <div className='modal-user-content'>
                      <span className='modal-user-label'>RUT:</span>
                      <span className='modal-user-value'>
                        {incidence.involvedUser.rut}
                      </span>
                    </div>
                  </div>

                  <div className='modal-user-detail'>
                    <FileText className='modal-user-icon' />
                    <div className='modal-user-content'>
                      <span className='modal-user-label'>Email:</span>
                      <span className='modal-user-value'>
                        {incidence.involvedUser.email}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className='modal-no-user'>
                  <UserX className='modal-no-user-icon' />
                  <p>No hay usuario involucrado en este reporte</p>
                </div>
              )}
            </div>
          </div>

          {/*  Descripción */}
          <div className='modal-detail-section'>
            <h3 className='modal-section-title'>
              <FileText className='modal-section-icon' />
              DESCRIPCIÓN DEL INCIDENTE
            </h3>
            <div className='modal-description-content'>
              <FileText className='modal-description-icon' />
              <p>
                {incidence?.description ||
                  'No hay descripción proporcionada para este incidente.'}
              </p>
            </div>
          </div>

          {/* Evidencia */}
          <div className='modal-detail-section'>
            <h3 className='modal-section-title'>
              <ImageIcon className='modal-section-icon' />
              EVIDENCIA ({images.length}{' '}
              {images.length === 1 ? 'imagen' : 'imágenes'})
            </h3>

            <div className='modal-evidence-display'>
              {images.length > 0 ? (
                <div className='modal-evidence-gallery'>
                  {/* Contenedor de imagen principal */}
                  <div className='modal-main-image-container'>
                    {modalImageError ? (
                      <div className='modal-image-error'>
                        <FileImage className='modal-error-icon' />
                        <p>No se pudo cargar la imagen</p>
                      </div>
                    ) : (
                      <img
                        src={images[currentModalImageIndex]}
                        alt={`Evidencia ${currentModalImageIndex + 1}`}
                        className='modal-main-evidence-image'
                        onError={() => setModalImageError(true)}
                        onLoad={() => setModalImageError(false)}
                      />
                    )}

                    {/* Controles de navegación */}
                    {images.length > 1 && (
                      <>
                        <button
                          className='modal-nav-button modal-prev-button'
                          onClick={prevModalImage}
                          aria-label='Imagen anterior'
                        >
                          <ChevronLeft className='modal-nav-icon' />
                        </button>

                        <button
                          className='modal-nav-button modal-next-button'
                          onClick={nextModalImage}
                          aria-label='Siguiente imagen'
                        >
                          <ChevronRight className='modal-nav-icon' />
                        </button>

                        {/* Contador de imágenes */}
                        <div className='modal-image-counter'>
                          {currentModalImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Miniaturas */}
                  {images.length > 1 && (
                    <div className='modal-thumbnails'>
                      {images.map((img, index) => (
                        <button
                          key={index}
                          className={`modal-thumbnail-button ${
                            index === currentModalImageIndex
                              ? 'modal-thumbnail-active'
                              : ''
                          }`}
                          onClick={() => setCurrentModalImageIndex(index)}
                          aria-label={`Ver imagen ${index + 1}`}
                        >
                          <img
                            src={img}
                            alt={`Miniatura ${index + 1}`}
                            className='modal-thumbnail-image'
                            onError={(e) => (e.target.style.display = 'none')}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className='modal-no-evidence'>
                  <FileImage className='modal-no-evidence-icon' />
                  <p>No hay evidencia adjunta a este reporte</p>
                </div>
              )}
            </div>
          </div>

          {/* Pie del Modal */}
          <div className='modal-main-footer'>
            <button
              className='modal-button modal-close-action-button'
              onClick={onClose}
            >
              <X className='modal-button-icon' />
              Cerrar Detalles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailsModal;