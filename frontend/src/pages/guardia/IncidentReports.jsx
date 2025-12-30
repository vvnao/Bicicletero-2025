import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, PlusCircle } from 'lucide-react';
import '@styles/Incident.css';
import IncidentForm from '../../components/guardia/IncidentForm';
import IncidentHistory from '../../components/guardia/IncidentHistory';
import { getIncidenceFormOptions } from '../../services/incident.service';

const IncidentReports = () => {
  const [activeTabIncidents, setActiveTabIncidents] = useState('create');
  const [formOptionsIncidents, setFormOptionsIncidents] = useState({
    types: [],
    severities: [],
    bikeracks: [],
  });
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [errorIncidents, setErrorIncidents] = useState(null);

  useEffect(() => {
    const loadFormOptions = async () => {
      try {
        setLoadingIncidents(true);
        setErrorIncidents(null);
        const data = await getIncidenceFormOptions();
        setFormOptionsIncidents(data);
      } catch (err) {
        console.error('Error cargando opciones:', err);
        setErrorIncidents('No se pudieron cargar las opciones del formulario');
      } finally {
        setLoadingIncidents(false);
      }
    };

    loadFormOptions();
  }, []);

  if (loadingIncidents) {
    return (
      <div className='incidents-loading-container'>
        <div className='incidents-spinner'></div>
        <p>Cargando opciones del formulario...</p>
      </div>
    );
  }

  if (errorIncidents) {
    return (
      <div className='incidents-error-container'>
        <AlertTriangle className='incidents-error-icon' />
        <p>{errorIncidents}</p>
        <button
          className='incidents-retry-button'
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className='incidents-main-container'>
      <div className='incidents-header-section'>
        <h1 className='incidents-title'>
          <AlertTriangle className='incidents-title-icon' />
          Reportes de Incidencias
        </h1>
        <div className='incidents-tabs-container'>
          <button
            className={`incidents-tab-button ${
              activeTabIncidents === 'create' ? 'incidents-tab-active' : ''
            }`}
            onClick={() => setActiveTabIncidents('create')}
          >
            <PlusCircle className='incidents-tab-icon' />
            Crear Reporte
          </button>
          <button
            className={`incidents-tab-button ${
              activeTabIncidents === 'history' ? 'incidents-tab-active' : ''
            }`}
            onClick={() => setActiveTabIncidents('history')}
          >
            <Clock className='incidents-tab-icon' />
            Historial de Reportes
          </button>
        </div>
      </div>

      <div className='incidents-content-container'>
        {activeTabIncidents === 'create' ? (
          <IncidentForm formOptions={formOptionsIncidents} />
        ) : (
          <IncidentHistory />
        )}
      </div>
    </div>
  );
};

export default IncidentReports;