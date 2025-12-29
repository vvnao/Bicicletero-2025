import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  getBikerackSpaces,
  searchUserByRut,
  createIncidence,
  createIncidenceWithEvidence,
} from '../../services/incident.service';
import '@styles/IncidentForm.css';

const IncidentForm = ({ formOptions }) => {
  const [formData, setFormData] = useState({
    bikerackId: '',
    spaceId: '',
    incidenceType: '',
    severity: 'Media',
    description: '',
    involvedUserId: null,
    dateTimeIncident: new Date(),
  });

  const [spaces, setSpaces] = useState([]);
  const [loadingSpaces, setLoadingSpaces] = useState(false);
  const [rutInput, setRutInput] = useState('');
  const [searchingUser, setSearchingUser] = useState(false);
  const [userResult, setUserResult] = useState(null);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [hour, setHour] = useState('00');
  const [minute, setMinute] = useState('00');

  useEffect(() => {
    if (formData.bikerackId) {
      loadSpaces(formData.bikerackId);
    } else {
      setSpaces([]);
      setFormData((prev) => ({ ...prev, spaceId: '' }));
    }
  }, [formData.bikerackId]);

  useEffect(() => {
    const newDate = new Date(formData.dateTimeIncident);
    newDate.setHours(parseInt(hour), parseInt(minute));
    setFormData((prev) => ({ ...prev, dateTimeIncident: newDate }));
  }, [hour, minute]);

  const loadSpaces = async (bikerackId) => {
    try {
      setLoadingSpaces(true);
      const spacesData = await getBikerackSpaces(bikerackId);
      setSpaces(spacesData);
    } catch (error) {
      setErrors((prev) => ({ ...prev, spaces: 'Error al cargar espacios' }));
    } finally {
      setLoadingSpaces(false);
    }
  };

  const handleSearchUser = async () => {
    if (!rutInput.trim()) {
      setErrors((prev) => ({ ...prev, rut: 'Ingrese un RUT' }));
      return;
    }

    const rutRegex = /^(\d{1,2}\.\d{3}\.\d{3}-[\dkK]|\d{7,8}-[\dkK])$/i;
    if (!rutRegex.test(rutInput)) {
      setErrors((prev) => ({
        ...prev,
        rut: 'Formato de RUT inválido. Use: 12.345.678-9 o 12345678-9',
      }));
      return;
    }

    try {
      setSearchingUser(true);
      setErrors((prev) => ({ ...prev, rut: null }));
      setUserResult(null);

      const result = await searchUserByRut(rutInput);

      setUserResult(result);

      if (result.found) {
        setFormData((prev) => ({
          ...prev,
          involvedUserId: parseInt(result.user.id),
          involvedUserRut: result.user.rut,
        }));

        setErrors((prev) => ({ ...prev, rut: null }));
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        'Error al buscar usuario. Intente nuevamente.';

      setErrors((prev) => ({
        ...prev,
        rut: errorMsg,
      }));

      setUserResult({
        found: false,
        message: 'No se pudo verificar el usuario',
      });
    } finally {
      setSearchingUser(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleDateChange = (date) => {
    const newDate = new Date(date);
    newDate.setHours(parseInt(hour), parseInt(minute));
    setFormData((prev) => ({ ...prev, dateTimeIncident: newDate }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024;
    const validFiles = files.filter((file) => file.size <= maxSize);

    if (validFiles.length !== files.length) {
      setErrors((prev) => ({
        ...prev,
        evidence: 'Algunos archivos superan 5MB',
      }));
    }

    if (evidenceFiles.length + validFiles.length > 5) {
      setErrors((prev) => ({
        ...prev,
        evidence: 'Máximo 5 imágenes por incidencia',
      }));
      return;
    }

    setEvidenceFiles((prev) => [...prev, ...validFiles]);
    setErrors((prev) => ({ ...prev, evidence: null }));
  };

  const removeFile = (index) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.bikerackId)
      newErrors.bikerackId = 'Seleccione un bicicletero';
    if (!formData.incidenceType)
      newErrors.incidenceType = 'Seleccione tipo de incidencia';
    if (!formData.severity) newErrors.severity = 'Seleccione gravedad';
    if (
      !formData.description.trim() ||
      formData.description.trim().length < 10
    ) {
      newErrors.description = 'Descripción debe tener al menos 10 caracteres';
    }
    if (!formData.dateTimeIncident || formData.dateTimeIncident > new Date()) {
      newErrors.dateTimeIncident = 'Fecha no puede ser futura';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});

      const incidenceData = {
        bikerackId: parseInt(formData.bikerackId),
        incidenceType: formData.incidenceType,
        severity: formData.severity,
        description: formData.description.trim(),
        dateTimeIncident: formData.dateTimeIncident.toISOString(),
        spaceId: formData.spaceId ? parseInt(formData.spaceId) : null,
        involvedUserId: formData.involvedUserId
          ? Number(formData.involvedUserId)
          : null,
      };

      let result;
      if (evidenceFiles.length > 0) {
        result = await createIncidenceWithEvidence(
          incidenceData,
          evidenceFiles
        );
      } else {
        result = await createIncidence(incidenceData);
      }

      setSuccess(true);

      setTimeout(() => {
        resetForm();
        setSuccess(false);
      }, 3000);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: error.response?.data?.message || 'Error al enviar reporte',
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      bikerackId: '',
      spaceId: '',
      incidenceType: '',
      severity: 'Media',
      description: '',
      involvedUserId: null,
      dateTimeIncident: new Date(),
    });
    setSpaces([]);
    setRutInput('');
    setUserResult(null);
    setEvidenceFiles([]);
    setErrors({});
    setHour('00');
    setMinute('00');
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0')
  );
  const minuteOptions = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0')
  );

  return (
    <form
      className='incident-form'
      onSubmit={handleSubmit}
    >
      {success && (
        <div className='alert alert-success'>
          ✅ Reporte enviado exitosamente
        </div>
      )}

      {errors.submit && (
        <div className='alert alert-error'>⚠️ {errors.submit}</div>
      )}

      <div className='form-section'>
        <h2 className='section-title'>📅 Fecha y Hora del Incidente *</h2>
        <div className='datetime-group'>
          <div className='form-group'>
            <label>Fecha</label>
            <DatePicker
              selected={formData.dateTimeIncident}
              onChange={handleDateChange}
              dateFormat='dd/MM/yyyy'
              maxDate={new Date()}
              className={`form-control ${
                errors.dateTimeIncident ? 'error' : ''
              }`}
              placeholderText='Seleccione fecha'
            />
          </div>

          <div className='time-group'>
            <div className='form-group'>
              <label>Hora</label>
              <select
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className='form-control time-select'
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

            <div className='form-group'>
              <label>Minutos</label>
              <select
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className='form-control time-select'
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
        {errors.dateTimeIncident && (
          <span className='error-text'>{errors.dateTimeIncident}</span>
        )}
      </div>

      <div className='form-section'>
        <h2 className='section-title'>📍 Ubicación</h2>
        <div className='form-row'>
          <div className='form-group'>
            <label>Bicicletero Afectado *</label>
            <select
              name='bikerackId'
              value={formData.bikerackId}
              onChange={handleInputChange}
              className={`form-control ${errors.bikerackId ? 'error' : ''}`}
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
            {errors.bikerackId && (
              <span className='error-text'>{errors.bikerackId}</span>
            )}
          </div>

          <div className='form-group'>
            <label>Espacio (Opcional)</label>
            <select
              name='spaceId'
              value={formData.spaceId}
              onChange={handleInputChange}
              className='form-control'
              disabled={!formData.bikerackId || loadingSpaces}
            >
              <option value=''>
                {loadingSpaces ? 'Cargando...' : 'Seleccione un espacio'}
              </option>
              {spaces.map((space) => (
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

      <div className='form-section'>
        <h2 className='section-title'>🏷️ Clasificación</h2>
        <div className='form-row'>
          <div className='form-group'>
            <label>Tipo de Incidencia *</label>
            <select
              name='incidenceType'
              value={formData.incidenceType}
              onChange={handleInputChange}
              className={`form-control ${errors.incidenceType ? 'error' : ''}`}
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
            {errors.incidenceType && (
              <span className='error-text'>{errors.incidenceType}</span>
            )}
          </div>

          <div className='form-group'>
            <label>Gravedad *</label>
            <div className='severity-options'>
              {(formOptions.severities || ['Baja', 'Media', 'Alta']).map(
                (sev, index) => (
                  <label
                    key={index}
                    className='severity-label'
                  >
                    <input
                      type='radio'
                      name='severity'
                      value={sev}
                      checked={formData.severity === sev}
                      onChange={handleInputChange}
                      className='severity-radio'
                    />
                    <span className={`severity-badge ${sev.toLowerCase()}`}>
                      {sev}
                    </span>
                  </label>
                )
              )}
            </div>
            {errors.severity && (
              <span className='error-text'>{errors.severity}</span>
            )}
          </div>
        </div>
      </div>

      <div className='form-section'>
        <h2 className='section-title'>👤 Usuario Involucrado (Opcional)</h2>
        <div className='user-search-group'>
          <div className='form-group'>
            <label>Buscar por RUT</label>
            <div className='search-input-group'>
              <input
                type='text'
                value={rutInput}
                onChange={(e) => {
                  setRutInput(e.target.value);
                  setErrors((prev) => ({ ...prev, rut: null }));
                }}
                placeholder='Ej: 12.345.678-9'
                className={`form-control ${errors.rut ? 'error' : ''}`}
              />
              <button
                type='button'
                onClick={handleSearchUser}
                disabled={searchingUser || !rutInput.trim()}
                className='search-btn'
              >
                {searchingUser ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
            {errors.rut && <span className='error-text'>{errors.rut}</span>}
          </div>

          {userResult && (
            <div
              className={`user-result ${
                userResult.found ? 'found' : 'not-found'
              }`}
            >
              {userResult.found ? (
                <>
                  <div className='user-info'>
                    <div className='user-header'>
                      <strong>✅ Usuario encontrado</strong>
                      <span className='user-status'>Vinculado al reporte</span>
                    </div>
                    <div className='user-details'>
                      <div className='detail-row'>
                        <span className='detail-label'>Nombre:</span>
                        <span className='detail-value'>
                          {userResult.user.fullName}
                        </span>
                      </div>
                      <div className='detail-row'>
                        <span className='detail-label'>RUT:</span>
                        <span className='detail-value'>
                          {userResult.user.rut}
                        </span>
                      </div>
                      <div className='detail-row'>
                        <span className='detail-label'>Email:</span>
                        <span className='detail-value'>
                          {userResult.user.email}
                        </span>
                      </div>
                      {userResult.user.bicycles &&
                        userResult.user.bicycles.length > 0 && (
                          <div className='detail-row'>
                            <span className='detail-label'>Bicicletas:</span>
                            <span className='detail-value'>
                              {userResult.user.bicycles.length} registrada(s)
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                  <button
                    type='button'
                    onClick={() => {
                      setRutInput('');
                      setUserResult(null);
                      setFormData((prev) => ({
                        ...prev,
                        involvedUserId: null,
                        involvedUserRut: null,
                      }));
                    }}
                    className='clear-user-btn'
                    title='Desvincular usuario'
                  >
                    ✕
                  </button>
                </>
              ) : (
                <div className='user-info'>
                  <div className='user-header'>
                    <strong>❌ Usuario no encontrado</strong>
                  </div>
                  <p className='error-message'>{userResult.message}</p>
                  <div className='hint'>
                    <small>
                      Puede continuar sin vincular usuario o verificar el RUT
                      ingresado.
                    </small>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className='form-section'>
        <h2 className='section-title'>📝 Descripción Detallada *</h2>
        <div className='form-group'>
          <textarea
            name='description'
            value={formData.description}
            onChange={handleInputChange}
            className={`form-control textarea ${
              errors.description ? 'error' : ''
            }`}
            placeholder='Describa los hechos en detalle...'
            rows='5'
          />
          <div className='textarea-info'>
            <span
              className={`char-count ${
                formData.description.length < 10 ? 'warning' : ''
              }`}
            >
              {formData.description.length} caracteres
            </span>
            <span>Mínimo 10 caracteres</span>
          </div>
          {errors.description && (
            <span className='error-text'>{errors.description}</span>
          )}
        </div>
      </div>

      <div className='form-section'>
        <h2 className='section-title'>🖼️ Evidencia (Opcional)</h2>
        <div className='form-group'>
          <div className='file-upload-area'>
            <input
              type='file'
              id='evidence-upload'
              multiple
              accept='image/jpeg,image/png,image/gif'
              onChange={handleFileChange}
              className='file-input'
            />
            <label
              htmlFor='evidence-upload'
              className='file-upload-label'
            >
              📎 Subir imágenes
            </label>
            <span className='file-info'>Máximo 5 imágenes, 5MB cada una</span>
          </div>

          {errors.evidence && (
            <span className='error-text'>{errors.evidence}</span>
          )}

          {evidenceFiles.length > 0 && (
            <div className='file-previews'>
              <h4>Imágenes adjuntadas ({evidenceFiles.length}/5):</h4>
              <div className='preview-grid'>
                {evidenceFiles.map((file, index) => (
                  <div
                    key={index}
                    className='file-preview'
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Evidencia ${index + 1}`}
                      className='preview-image'
                    />
                    <div className='file-info'>
                      <span>{file.name}</span>
                      <span>{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <button
                      type='button'
                      onClick={() => removeFile(index)}
                      className='remove-file-btn'
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='form-actions'>
        <button
          type='button'
          onClick={resetForm}
          className='btn btn-secondary'
          disabled={submitting}
        >
          Limpiar Formulario
        </button>

        <button
          type='submit'
          className='btn btn-primary'
          disabled={submitting}
        >
          {submitting ? 'Enviando...' : 'Enviar Reporte'}
        </button>
      </div>
    </form>
  );
};

export default IncidentForm;
