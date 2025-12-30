import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Calendar,
  MapPin,
  Tag,
  User,
  FileText,
  Image as ImageIcon,
  X,
  Search,
  CheckCircle,
  XCircle,
  Upload,
  Clock,
  Send,
  Trash2,
} from 'lucide-react';
import {
  getBikerackSpaces,
  searchUserByRut,
  createIncidence,
  createIncidenceWithEvidence,
} from '../../services/incident.service';
import '@styles/IncidentForm.css';

const IncidentForm = ({ formOptions }) => {
  const [formDataIncident, setFormDataIncident] = useState({
    bikerackId: '',
    spaceId: '',
    incidenceType: '',
    severity: 'Media',
    description: '',
    involvedUserId: null,
    dateTimeIncident: new Date(),
  });

  const [spacesIncident, setSpacesIncident] = useState([]);
  const [loadingSpacesIncident, setLoadingSpacesIncident] = useState(false);
  const [rutInputIncident, setRutInputIncident] = useState('');
  const [searchingUserIncident, setSearchingUserIncident] = useState(false);
  const [userResultIncident, setUserResultIncident] = useState(null);
  const [evidenceFilesIncident, setEvidenceFilesIncident] = useState([]);
  const [errorsIncident, setErrorsIncident] = useState({});
  const [submittingIncident, setSubmittingIncident] = useState(false);
  const [successIncident, setSuccessIncident] = useState(false);

  const [hourIncident, setHourIncident] = useState('00');
  const [minuteIncident, setMinuteIncident] = useState('00');

  useEffect(() => {
    if (formDataIncident.bikerackId) {
      loadSpaces(formDataIncident.bikerackId);
    } else {
      setSpacesIncident([]);
      setFormDataIncident((prev) => ({ ...prev, spaceId: '' }));
    }
  }, [formDataIncident.bikerackId]);

  useEffect(() => {
    const newDate = new Date(formDataIncident.dateTimeIncident);
    newDate.setHours(parseInt(hourIncident), parseInt(minuteIncident));
    setFormDataIncident((prev) => ({ ...prev, dateTimeIncident: newDate }));
  }, [hourIncident, minuteIncident]);

  const loadSpaces = async (bikerackId) => {
    try {
      setLoadingSpacesIncident(true);
      const spacesData = await getBikerackSpaces(bikerackId);
      setSpacesIncident(spacesData);
    } catch (error) {
      setErrorsIncident((prev) => ({
        ...prev,
        spaces: 'Error al cargar espacios',
      }));
    } finally {
      setLoadingSpacesIncident(false);
    }
  };

  const handleSearchUser = async () => {
    if (!rutInputIncident.trim()) {
      setErrorsIncident((prev) => ({ ...prev, rut: 'Ingrese un RUT' }));
      return;
    }

    const rutRegex = /^(\d{1,2}\.\d{3}\.\d{3}-[\dkK]|\d{7,8}-[\dkK])$/i;
    if (!rutRegex.test(rutInputIncident)) {
      setErrorsIncident((prev) => ({
        ...prev,
        rut: 'Formato de RUT inválido. Use: 12.345.678-9 o 12345678-9',
      }));
      return;
    }

    try {
      setSearchingUserIncident(true);
      setErrorsIncident((prev) => ({ ...prev, rut: null }));
      setUserResultIncident(null);

      const result = await searchUserByRut(rutInputIncident);

      if (result.found) {
        setUserResultIncident(result);
        setFormDataIncident((prev) => ({
          ...prev,
          involvedUserId: parseInt(result.user.id),
          involvedUserRut: result.user.rut,
        }));
      } else {
        setErrorsIncident((prev) => ({
          ...prev,
          rut: `El RUT ${rutInputIncident} no está registrado. Puede continuar sin vincular usuario.`,
        }));
        setUserResultIncident(null);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        'Error al buscar usuario. Intente nuevamente.';

      setErrorsIncident((prev) => ({
        ...prev,
        rut: errorMsg,
      }));

      setUserResultIncident(null);
    } finally {
      setSearchingUserIncident(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormDataIncident((prev) => ({ ...prev, [name]: value }));
    setErrorsIncident((prev) => ({ ...prev, [name]: null }));
  };

  const handleDateChange = (date) => {
    const newDate = new Date(date);
    newDate.setHours(parseInt(hourIncident), parseInt(minuteIncident));
    setFormDataIncident((prev) => ({ ...prev, dateTimeIncident: newDate }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024;
    const validFiles = files.filter((file) => file.size <= maxSize);

    if (validFiles.length !== files.length) {
      setErrorsIncident((prev) => ({
        ...prev,
        evidence: 'Algunos archivos superan 5MB',
      }));
    }

    if (evidenceFilesIncident.length + validFiles.length > 5) {
      setErrorsIncident((prev) => ({
        ...prev,
        evidence: 'Máximo 5 imágenes por incidencia',
      }));
      return;
    }

    setEvidenceFilesIncident((prev) => [...prev, ...validFiles]);
    setErrorsIncident((prev) => ({ ...prev, evidence: null }));
  };

  const removeFile = (index) => {
    if (evidenceFilesIncident[index]) {
      URL.revokeObjectURL(evidenceFilesIncident[index]);
    }
    setEvidenceFilesIncident((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formDataIncident.bikerackId)
      newErrors.bikerackId = 'Seleccione un bicicletero';
    if (!formDataIncident.incidenceType)
      newErrors.incidenceType = 'Seleccione tipo de incidencia';
    if (!formDataIncident.severity) newErrors.severity = 'Seleccione gravedad';
    if (
      !formDataIncident.description.trim() ||
      formDataIncident.description.trim().length < 10
    ) {
      newErrors.description = 'Descripción debe tener al menos 10 caracteres';
    }
    if (
      !formDataIncident.dateTimeIncident ||
      formDataIncident.dateTimeIncident > new Date()
    ) {
      newErrors.dateTimeIncident = 'Fecha no puede ser futura';
    }

    setErrorsIncident(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    const now = new Date();

    setFormDataIncident({
      bikerackId: '',
      spaceId: '',
      incidenceType: '',
      severity: 'Media',
      description: '',
      involvedUserId: null,
      dateTimeIncident: now,
    });

    setSpacesIncident([]);
    setRutInputIncident('');
    setUserResultIncident(null);

    //* Limpiar URLs de las imágenes
    evidenceFilesIncident.forEach((file) => {
      if (typeof file === 'object' && file !== null) {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      }
    });
    setEvidenceFilesIncident([]);

    setErrorsIncident({});
    setHourIncident(now.getHours().toString().padStart(2, '0'));
    setMinuteIncident(now.getMinutes().toString().padStart(2, '0'));
    setSubmittingIncident(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submittingIncident || successIncident) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setSubmittingIncident(true);
      setErrorsIncident({});

      const incidenceData = {
        bikerackId: parseInt(formDataIncident.bikerackId),
        incidenceType: formDataIncident.incidenceType,
        severity: formDataIncident.severity,
        description: formDataIncident.description.trim(),
        dateTimeIncident: formDataIncident.dateTimeIncident.toISOString(),
        spaceId: formDataIncident.spaceId
          ? parseInt(formDataIncident.spaceId)
          : null,
        involvedUserId: formDataIncident.involvedUserId
          ? Number(formDataIncident.involvedUserId)
          : null,
      };

      let result;
      if (evidenceFilesIncident.length > 0) {
        result = await createIncidenceWithEvidence(
          incidenceData,
          evidenceFilesIncident
        );
      } else {
        result = await createIncidence(incidenceData);
      }

      setSuccessIncident(true);

      resetForm();

      setTimeout(() => {
        setSuccessIncident(false);
      }, 3000);
    } catch (error) {
      setErrorsIncident((prev) => ({
        ...prev,
        submit: error.response?.data?.message || 'Error al enviar reporte',
      }));
    } finally {
      setSubmittingIncident(false);
    }
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0')
  );
  const minuteOptions = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0')
  );

  return (
    <div className='incident-form-wrapper'>
      <form
        className='incident-form-container'
        onSubmit={handleSubmit}
      >
        {successIncident && (
          <div className='incident-alert-success'>
            <CheckCircle className='incident-alert-icon' />
            Reporte enviado exitosamente
          </div>
        )}

        {errorsIncident.submit && (
          <div className='incident-alert-error'>
            <XCircle className='incident-alert-icon' />
            {errorsIncident.submit}
          </div>
        )}

        {/* Sección de Fecha y Hora */}
        <div className='incident-form-section'>
          <h2 className='incident-section-title'>
            <Calendar className='incident-section-icon' />
            Fecha y Hora del Incidente{' '}
            <span className='incident-required-asterisk'>*</span>
          </h2>
          <div className='incident-datetime-group'>
            <div className='incident-form-group'>
              <label className='incident-form-label'>Fecha</label>
              <DatePicker
                selected={formDataIncident.dateTimeIncident}
                onChange={handleDateChange}
                dateFormat='dd/MM/yyyy'
                maxDate={new Date()}
                className={`incident-form-control ${
                  errorsIncident.dateTimeIncident ? 'incident-form-error' : ''
                }`}
                placeholderText='Seleccione fecha'
              />
            </div>

            <div className='incident-time-group'>
              <div className='incident-form-group'>
                <label className='incident-form-label'>Hora</label>
                <div className='incident-select-wrapper'>
                  <Clock className='incident-select-icon' />
                  <select
                    value={hourIncident}
                    onChange={(e) => setHourIncident(e.target.value)}
                    className='incident-form-control incident-time-select'
                  >
                    {hourOptions.map((h) => (
                      <option
                        key={h}
                        value={h}
                      >
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className='incident-form-group'>
                <label className='incident-form-label'>Minutos</label>
                <div className='incident-select-wrapper'>
                  <Clock className='incident-select-icon' />
                  <select
                    value={minuteIncident}
                    onChange={(e) => setMinuteIncident(e.target.value)}
                    className='incident-form-control incident-time-select'
                  >
                    {minuteOptions.map((m) => (
                      <option
                        key={m}
                        value={m}
                      >
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          {errorsIncident.dateTimeIncident && (
            <span className='incident-error-text'>
              {errorsIncident.dateTimeIncident}
            </span>
          )}
        </div>

        {/* Sección de Ubicación */}
        <div className='incident-form-section'>
          <h2 className='incident-section-title'>
            <MapPin className='incident-section-icon' />
            Ubicación
          </h2>
          <div className='incident-form-row'>
            <div className='incident-form-group'>
              <label className='incident-form-label'>
                Bicicletero Afectado{' '}
                <span className='incident-required-asterisk'>*</span>
              </label>
              <div className='incident-select-wrapper'>
                <MapPin className='incident-select-icon' />
                <select
                  name='bikerackId'
                  value={formDataIncident.bikerackId}
                  onChange={handleInputChange}
                  className={`incident-form-control ${
                    errorsIncident.bikerackId ? 'incident-form-error' : ''
                  }`}
                >
                  <option value=''>Seleccione un bicicletero</option>
                  {formOptions.bikeracks?.map((bikerack) => (
                    <option
                      key={bikerack.id}
                      value={bikerack.id}
                    >
                      {bikerack.name} (Capacidad: {bikerack.capacity})
                    </option>
                  ))}
                </select>
              </div>
              {errorsIncident.bikerackId && (
                <span className='incident-error-text'>
                  {errorsIncident.bikerackId}
                </span>
              )}
            </div>

            <div className='incident-form-group'>
              <label className='incident-form-label'>Espacio (Opcional)</label>
              <div className='incident-select-wrapper'>
                <MapPin className='incident-select-icon' />
                <select
                  name='spaceId'
                  value={formDataIncident.spaceId}
                  onChange={handleInputChange}
                  className='incident-form-control'
                  disabled={
                    !formDataIncident.bikerackId || loadingSpacesIncident
                  }
                >
                  <option value=''>
                    {loadingSpacesIncident
                      ? 'Cargando...'
                      : 'Seleccione un espacio'}
                  </option>
                  {spacesIncident.map((space) => (
                    <option
                      key={space.id}
                      value={space.id}
                    >
                      {space.spaceCode} ({space.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Clasificación */}
        <div className='incident-form-section'>
          <h2 className='incident-section-title'>
            <Tag className='incident-section-icon' />
            Clasificación
          </h2>
          <div className='incident-form-row'>
            <div className='incident-form-group'>
              <label className='incident-form-label'>
                Tipo de Incidencia{' '}
                <span className='incident-required-asterisk'>*</span>
              </label>
              <div className='incident-select-wrapper'>
                <Tag className='incident-select-icon' />
                <select
                  name='incidenceType'
                  value={formDataIncident.incidenceType}
                  onChange={handleInputChange}
                  className={`incident-form-control ${
                    errorsIncident.incidenceType ? 'incident-form-error' : ''
                  }`}
                >
                  <option value=''>Seleccione tipo</option>
                  {formOptions.types?.map((type, index) => (
                    <option
                      key={index}
                      value={type}
                    >
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              {errorsIncident.incidenceType && (
                <span className='incident-error-text'>
                  {errorsIncident.incidenceType}
                </span>
              )}
            </div>

            <div className='incident-form-group'>
              <label className='incident-form-label'>
                Gravedad <span className='incident-required-asterisk'>*</span>
              </label>
              <div className='incident-severity-options'>
                {(formOptions.severities || ['Baja', 'Media', 'Alta']).map(
                  (sev, index) => (
                    <label
                      key={index}
                      className='incident-severity-label'
                    >
                      <input
                        type='radio'
                        name='severity'
                        value={sev}
                        checked={formDataIncident.severity === sev}
                        onChange={handleInputChange}
                        className='incident-severity-radio'
                      />
                      <span
                        className={`incident-severity-badge incident-severity-${sev.toLowerCase()}`}
                      >
                        {sev}
                      </span>
                    </label>
                  )
                )}
              </div>
              {errorsIncident.severity && (
                <span className='incident-error-text'>
                  {errorsIncident.severity}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sección de Usuario */}
        <div className='incident-form-section'>
          <h2 className='incident-section-title'>
            <User className='incident-section-icon' />
            Usuario Involucrado (Opcional)
          </h2>
          <div className='incident-user-search-group'>
            <div className='incident-form-group'>
              <label className='incident-form-label'>Buscar por RUT</label>
              <div className='incident-search-input-group'>
                <div className='incident-input-wrapper'>
                  <User className='incident-input-icon' />
                  <input
                    type='text'
                    value={rutInputIncident}
                    onChange={(e) => {
                      setRutInputIncident(e.target.value);
                      setErrorsIncident((prev) => ({ ...prev, rut: null }));
                    }}
                    placeholder='Ej: 12.345.678-9'
                    className={`incident-form-control ${
                      errorsIncident.rut ? 'incident-form-error' : ''
                    }`}
                  />
                </div>
                <button
                  type='button'
                  onClick={handleSearchUser}
                  disabled={searchingUserIncident || !rutInputIncident.trim()}
                  className='incident-search-button'
                >
                  <Search className='incident-search-icon' />
                  {searchingUserIncident ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
              {errorsIncident.rut && (
                <span className='incident-error-text'>
                  {errorsIncident.rut}
                </span>
              )}
            </div>

            {userResultIncident && userResultIncident.found && (
              <div className='incident-user-result incident-user-found'>
                <div className='incident-user-info'>
                  <div className='incident-user-header'>
                    <CheckCircle className='incident-user-status-icon' />
                    <div>
                      <strong>Usuario encontrado</strong>
                      <span className='incident-user-status'>
                        Vinculado al reporte
                      </span>
                    </div>
                  </div>
                  <div className='incident-user-details-grid'>
                    <div className='incident-detail-item'>
                      <span className='incident-detail-label'>Nombre:</span>
                      <span className='incident-detail-value'>
                        {userResultIncident.user.fullName}
                      </span>
                    </div>
                    <div className='incident-detail-item'>
                      <span className='incident-detail-label'>RUT:</span>
                      <span className='incident-detail-value'>
                        {userResultIncident.user.rut}
                      </span>
                    </div>
                    <div className='incident-detail-item'>
                      <span className='incident-detail-label'>Email:</span>
                      <span className='incident-detail-value'>
                        {userResultIncident.user.email}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type='button'
                  onClick={() => {
                    setRutInputIncident('');
                    setUserResultIncident(null);
                    setFormDataIncident((prev) => ({
                      ...prev,
                      involvedUserId: null,
                      involvedUserRut: null,
                    }));
                  }}
                  className='incident-clear-user-button'
                  title='Desvincular usuario'
                >
                  <X className='incident-clear-icon' />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sección de Descripción */}
        <div className='incident-form-section'>
          <div className='incident-form-group'>
            <label className='incident-form-label'>
              Descripción Detallada{' '}
              <span className='incident-required-asterisk'>*</span>
            </label>
            <div className='incident-textarea-wrapper'>
              <FileText className='incident-textarea-icon' />
              <textarea
                name='description'
                value={formDataIncident.description}
                onChange={handleInputChange}
                className={`incident-form-control incident-textarea ${
                  errorsIncident.description ? 'incident-form-error' : ''
                }`}
                placeholder='Describa los hechos en detalle...'
                rows='5'
              />
            </div>
            <div className='incident-textarea-info'>
              <span
                className={`incident-char-count ${
                  formDataIncident.description.length < 10
                    ? 'incident-char-warning'
                    : ''
                }`}
              >
                {formDataIncident.description.length} caracteres
              </span>
              <span>Mínimo 10 caracteres</span>
            </div>
            {errorsIncident.description && (
              <span className='incident-error-text'>
                {errorsIncident.description}
              </span>
            )}
          </div>
        </div>

        {/* Sección de Evidencia */}
        <div className='incident-form-section'>
          <h2 className='incident-section-title'>
            <ImageIcon className='incident-section-icon' />
            Evidencia (Opcional)
          </h2>
          <div className='incident-form-group'>
            <div className='incident-file-upload-area'>
              <input
                type='file'
                id='evidence-upload-incident'
                multiple
                accept='image/jpeg,image/png,image/gif'
                onChange={handleFileChange}
                className='incident-file-input'
              />
              <label
                htmlFor='evidence-upload-incident'
                className='incident-file-upload-label'
              >
                <Upload className='incident-upload-icon' />
                Subir imágenes
              </label>
              <span className='incident-file-info'>
                Máximo 5 imágenes, 5MB cada una
              </span>
            </div>

            {errorsIncident.evidence && (
              <span className='incident-error-text'>
                {errorsIncident.evidence}
              </span>
            )}

            {evidenceFilesIncident.length > 0 && (
              <div className='incident-file-previews'>
                <h4>Imágenes adjuntadas ({evidenceFilesIncident.length}/5):</h4>
                <div className='incident-preview-grid'>
                  {evidenceFilesIncident.map((file, index) => (
                    <div
                      key={index}
                      className='incident-file-preview'
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Evidencia ${index + 1}`}
                        className='incident-preview-image'
                      />
                      <div className='incident-file-info'>
                        <span>{file.name}</span>
                        <span>{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <button
                        type='button'
                        onClick={() => removeFile(index)}
                        className='incident-remove-file-button'
                        title='Eliminar archivo'
                      >
                        <Trash2 className='incident-remove-icon' />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className='incident-form-actions'>
          <button
            type='button'
            onClick={() => {
              resetForm();
              setSuccessIncident(false);
            }}
            className='incident-button incident-button-secondary'
            disabled={submittingIncident || successIncident}
          >
            <Trash2 className='incident-button-icon' />
            Limpiar Formulario
          </button>

          <button
            type='submit'
            className='incident-button incident-button-primary'
            disabled={submittingIncident || successIncident}
          >
            <Send className='incident-button-icon' />
            {submittingIncident
              ? 'Enviando...'
              : successIncident
              ? 'Enviado ✓'
              : 'Enviar Reporte'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IncidentForm;