import React, { useState, useEffect } from 'react';
import '@styles/IncidentDetailsModal.css';

const IncidentDetailsModal = ({ incidence, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  //! obtener url imagem
  const getImageUrls = () => {
    //! primero verifica si hay evidencia
    if (incidence?.evidences && incidence.evidences.length > 0) {
      return incidence.evidences.map((evidence) => {
        let url = evidence.url;

        if (url && url.startsWith('/')) {
          return `${window.location.origin}${url}`;
        }

        return url;
      });
    }

    if (incidence?.evidenceUrl) {
      let url = incidence.evidenceUrl;

      if (url && url.startsWith('/')) {
        return [`${window.location.origin}${url}`];
      }

      return [url];
    }

    return [];
  };

  const images = getImageUrls();

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length
      );
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const formatDateTime = (dateString) => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${date.getFullYear()} ${date
      .getHours()
      .toString()
      .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'alta':
        return '🔴';
      case 'media':
        return '🟠';
      case 'baja':
        return '🟢';
      default:
        return '⚪';
    }
  };

  if (!incidence) return null;

  return (
    <div
      className='modal-overlay'
      onClick={handleOverlayClick}
    >
      <div
        className='modal-content'
        onClick={(e) => e.stopPropagation()}
      >
        {/* encabezado */}
        <div className='modal-header'>
          <h2>
            Detalles del Reporte #
            {incidence?.id?.toString().padStart(3, '0') || '000'}
          </h2>
          <button
            className='modal-close'
            onClick={onClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* contenido */}
        <div className='modal-body'>
          {/* información General */}
          <div className='info-section'>
            <h3> INFORMACIÓN GENERAL</h3>
            <div className='info-grid'>
              <div className='info-item'>
                <span className='info-label'>ID:</span>
                <span className='info-value'>
                  #{incidence?.id?.toString().padStart(3, '0') || '000'}
                </span>
              </div>
              <div className='info-item'>
                <span className='info-label'>Reportado por:</span>
                <span className='info-value'>
                  {incidence?.reporter?.names || 'Guardia'}{' '}
                  {incidence?.reporter?.lastName || ''}
                </span>
              </div>
              <div className='info-item'>
                <span className='info-label'>Fecha creación:</span>
                <span className='info-value'>
                  {formatDateTime(incidence?.dateTimeReport)}
                </span>
              </div>
              <div className='info-item'>
                <span className='info-label'>Estado:</span>
                <span
                  className={`info-value status-badge status-${(
                    incidence?.status || 'Abierta'
                  )
                    .toLowerCase()
                    .replace(/\s+/g, '-')}`}
                >
                  {incidence?.status || 'Abierta'}
                </span>
              </div>
            </div>
          </div>

          {/* fecha del Incidente */}
          <div className='detail-section'>
            <h3> FECHA Y HORA DEL INCIDENTE</h3>
            <div className='detail-value'>
              {formatDateTime(incidence?.dateTimeIncident)}
            </div>
          </div>

          {/* ubicación */}
          <div className='detail-section'>
            <h3> UBICACIÓN</h3>
            <div className='form-row'>
              <div className='form-group'>
                <label>Bicicletero</label>
                <div className='detail-value'>
                  {incidence?.bikerack?.name || 'No especificado'}
                </div>
              </div>

              <div className='form-group'>
                <label>
                  {incidence?.space ? 'Espacio' : 'Espacio (Opcional)'}
                </label>
                <div className='detail-value'>
                  {incidence?.space?.spaceCode ||
                    incidence?.space?.code ||
                    incidence?.space?.name ||
                    'No especificado'}
                </div>
              </div>
            </div>
          </div>

          {/* clasificación */}
          <div className='detail-section'>
            <h3> CLASIFICACIÓN</h3>
            <div className='form-row'>
              <div className='form-group'>
                <label>Tipo de Incidencia</label>
                <div className='detail-value type-badge'>
                  {incidence?.incidenceType || 'No especificado'}
                </div>
              </div>

              <div className='form-group'>
                <label>Gravedad</label>
                <div className='detail-value severity-badge'>
                  {getSeverityIcon(incidence?.severity)}{' '}
                  {incidence?.severity || 'No especificada'}
                </div>
              </div>
            </div>
          </div>

          {/* usuario Involucrado */}
          <div className='detail-section'>
            <h3> USUARIO INVOLUCRADO (Opcional)</h3>
            <div className='user-info-display'>
              {incidence?.involvedUser ? (
                <>
                  <div className='user-detail'>
                    <span className='user-label'>Nombre:</span>
                    <span className='user-value'>
                      {incidence.involvedUser.names}{' '}
                      {incidence.involvedUser.lastName}
                    </span>
                  </div>
                  <div className='user-detail'>
                    <span className='user-label'>RUT:</span>
                    <span className='user-value'>
                      {incidence.involvedUser.rut}
                    </span>
                  </div>
                  <div className='user-detail'>
                    <span className='user-label'>Email:</span>
                    <span className='user-value'>
                      {incidence.involvedUser.email}
                    </span>
                  </div>
                </>
              ) : (
                <div className='no-user'>No hay usuario involucrado</div>
              )}
            </div>
          </div>

          {/* descripción */}
          <div className='detail-section'>
            <h3> DESCRIPCIÓN</h3>
            <div className='description-content'>
              {incidence?.description || 'No hay descripción'}
            </div>
          </div>

          {/* evidencia */}
          <div className='detail-section'>
            <h3> EVIDENCIA ({images.length} imágenes)</h3>
            <div className='evidence-display'>
              {images.length > 0 ? (
                <div className='evidence-gallery'>
                  {/* imagen principal */}
                  <div className='main-image-container'>
                    <img
                      src={images[currentImageIndex]}
                      alt={`Evidencia ${currentImageIndex + 1}`}
                      className='main-evidence-image'
                      onError={(e) => {
                        console.error(
                          'Error cargando imagen:',
                          images[currentImageIndex]
                        );
                        setImageError(true);
                        e.target.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log('✅ Imagen cargada exitosamente');
                        setImageError(false);
                      }}
                    />

                    {/* controles de navegación si hay más de 1 imagen */}
                    {images.length > 1 && (
                      <>
                        <button
                          className='nav-btn prev-btn'
                          onClick={prevImage}
                          aria-label='Imagen anterior'
                        >
                          ◀
                        </button>
                        <button
                          className='nav-btn next-btn'
                          onClick={nextImage}
                          aria-label='Siguiente imagen'
                        >
                          ▶
                        </button>

                        {/* indicador de posición */}
                        <div className='image-counter'>
                          {currentImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* miniaturas (si hay más de 1 imagen) */}
                  {images.length > 1 && (
                    <div className='thumbnails'>
                      {images.map((img, index) => (
                        <button
                          key={index}
                          className={`thumbnail-btn ${
                            index === currentImageIndex ? 'active' : ''
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <img
                            src={img}
                            alt={`Miniatura ${index + 1}`}
                            className='thumbnail'
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {imageError && (
                    <div className='image-error'>
                      <p> No se pudo cargar la imagen</p>
                      <p>
                        <small>URL: {images[currentImageIndex]}</small>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className='no-evidence'>No hay evidencia adjunta</div>
              )}
            </div>
          </div>

          {/* footer solo con botón de cerrar */}
          <div className='modal-footer'>
            <button
              className='btn-close'
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailsModal;
