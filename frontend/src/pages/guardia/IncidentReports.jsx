import React, { useState, useEffect } from 'react';
import '@styles/Incident.css';
import IncidentForm from '../../components/guardia/IncidentForm';
import IncidentHistory from '../../components/guardia/IncidentHistory';
import { getIncidenceFormOptions } from '../../services/incident.service';

const IncidentReports = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [formOptions, setFormOptions] = useState({
    types: [],
    severities: [],
    bikeracks: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFormOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getIncidenceFormOptions();
        setFormOptions(data);
      } catch (err) {
        console.error('Error cargando opciones:', err);
        setError('No se pudieron cargar las opciones del formulario');
      } finally {
        setLoading(false);
      }
    };

    loadFormOptions();
  }, []);

  if (loading) {
    return (
      <div className='incidents-loading'>
        <div className='spinner'></div>
        <p>Cargando opciones del formulario...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='incidents-error'>
        <div className='error-icon'>⚠️</div>
        <p>{error}</p>
        <button
          className='retry-btn'
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className='incidents-container'>
      <div className='incidents-header'>
        <h1>🚲 Reportes de Incidencias</h1>
        <div className='incidents-tabs'>
          <button
            className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Crear Reporte
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Historial de Reportes
          </button>
        </div>
      </div>

      <div className='incidents-content'>
        {activeTab === 'create' ? (
          <IncidentForm formOptions={formOptions} />
        ) : (
          <IncidentHistory />
        )}
      </div>
    </div>
  );
};

export default IncidentReports;
