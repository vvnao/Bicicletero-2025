import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  getMyIncidenceReports,
  getIncidenceFormOptions,
  deleteIncidence,
  getIncidenceDetail,
} from '../../services/incident.service';
import IncidentDetailsModal from './IncidentDetailsModal';
import '@styles/IncidentHistory.css';

const IncidentHistory = () => {
  const [incidences, setIncidences] = useState([]);
  const [filteredIncidences, setFilteredIncidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncidence, setSelectedIncidence] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [formOptions, setFormOptions] = useState({
    types: [],
    severities: [],
    bikeracks: [],
  });
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    type: 'all',
    severity: 'all',
    status: 'all',
  });

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        const incidencesData = await getMyIncidenceReports();
        setIncidences(incidencesData);
        setFilteredIncidences(incidencesData);

        const optionsData = await getIncidenceFormOptions();
        setFormOptions(optionsData);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [incidences, filters]);

  const loadIncidences = async () => {
    try {
      const data = await getMyIncidenceReports();
      setIncidences(data);
      setFilteredIncidences(data);
    } catch (error) {
      console.error('Error cargando incidencias:', error);
    }
  };

const handleDeleteIncidence = async (incidenceId) => {
  const incidenceNumber = incidenceId.toString().padStart(3, '0');

  const userConfirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar la incidencia #${incidenceNumber}?\n\n` +
      `Esta acción no se puede deshacer.`
  );

  if (!userConfirmed) {
    return; 
  }

  try {
    await deleteIncidence(incidenceId);
    await loadIncidences(); 
    window.alert(`Incidencia #${incidenceNumber} eliminada correctamente`);
  } catch (error) {
    console.error('Error al eliminar incidencia:', error);
    window.alert(`Error: ${error.message}`);
  }
};

  const openIncidenceDetails = async (incidence) => {
    try {
      setLoadingDetail(true);
      setSelectedIncidence(null);

      console.log('🔍 Obteniendo detalles de incidencia ID:', incidence.id);
      const incidenceDetail = await getIncidenceDetail(incidence.id);

      console.log('✅ Datos recibidos:', incidenceDetail);

      setTimeout(() => {
        setSelectedIncidence(incidenceDetail);
        setShowModal(true);
      }, 50);
    } catch (error) {
      console.error(' Error obteniendo detalles:', error);
      console.error(' Usando datos de lista como fallback');

      setTimeout(() => {
        setSelectedIncidence(incidence);
        setShowModal(true);
      }, 50);
    } finally {
      setTimeout(() => {
        setLoadingDetail(false);
      }, 100);
    }
  };

  const applyFilters = () => {
    let filtered = [...incidences];

    if (filters.startDate) {
      filtered = filtered.filter(
        (inc) => new Date(inc.dateTimeIncident) >= filters.startDate
      );
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (inc) => new Date(inc.dateTimeIncident) <= endDate
      );
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter((inc) => inc.incidenceType === filters.type);
    }

    if (filters.severity !== 'all') {
      filtered = filtered.filter((inc) => inc.severity === filters.severity);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter((inc) => inc.status === filters.status);
    }

    setFilteredIncidences(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      type: 'all',
      severity: 'all',
      status: 'all',
    });
  };

  const currentItems = filteredIncidences;

  const uniqueTypes = [...new Set(incidences.map((i) => i.incidenceType))];
  const uniqueSeverities = [...new Set(incidences.map((i) => i.severity))];
  const uniqueStatuses = [...new Set(incidences.map((i) => i.status))];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'Alta':
        return '🔴';
      case 'Media':
        return '🟠';
      case 'Baja':
        return '🟢';
      default:
        return '⚪';
    }
  };

  if (loading) {
    return (
      <div className='incidents-loading'>
        <div className='spinner'></div>
        <p>Cargando historial de incidencias...</p>
      </div>
    );
  }

  return (
    <div className='incident-history'>
      <h2> Historial de Reportes</h2>
      <p className='summary'>
        Total de incidencias: {incidences.length} | Mostrando:{' '}
        {filteredIncidences.length}
      </p>

      {/* filtros */}
      <div className='filters-section'>
        <h3> Filtros</h3>
        <div className='filters-grid'>
          <div className='filter-group'>
            <label>Fecha desde</label>
            <DatePicker
  selected={filters.startDate}
  onChange={(date) => handleFilterChange('startDate', date)}
  dateFormat='dd/MM/yyyy'
  placeholderText='DD/MM/AAAA'
  className='datepicker-default' // <- Nueva clase
/>
          </div>

          <div className='filter-group'>
            <label>Fecha hasta</label>
            <DatePicker
              selected={filters.endDate}
              onChange={(date) => handleFilterChange('endDate', date)}
              dateFormat='dd/MM/yyyy'
              placeholderText='DD/MM/AAAA'
              className='filter-input'
            />
          </div>
          

          <div className='filter-group'>
            <label>Tipo</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className='filter-select'
            >
              <option value='all'>Todos</option>
              {uniqueTypes.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className='filter-group'>
            <label>Gravedad</label>
            <select
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              className='filter-select'
            >
              <option value='all'>Todas</option>
              {uniqueSeverities.map((sev) => (
                <option
                  key={sev}
                  value={sev}
                >
                  {sev}
                </option>
              ))}
            </select>
          </div>

          <div className='filter-group'>
            <label>Estado</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className='filter-select'
            >
              <option value='all'>Todos</option>
              {uniqueStatuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='filter-actions'>
          <button
            onClick={applyFilters}
            className='btn btn-apply'
          >
            Aplicar Filtros
          </button>
          <button
            onClick={resetFilters}
            className='btn btn-reset'
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* tabla de incidencias */}
      <div className='incidence-table-section'>
        <div className='table-header'>
          <h3> Reportes Registrados</h3>
          <span className='counter'>
            {filteredIncidences.length} incidencias
          </span>
        </div>
        <div className='table-container'>
          <table className='incidence-table'>
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha Incidente</th>
                <th>Tipo</th>
                <th>Gravedad</th>
                <th>Estado</th>
                <th>Bicicletero</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan='7'
                    className='no-data'
                  >
                    No hay incidencias que coincidan con los filtros
                  </td>
                </tr>
              ) : (
                currentItems.map((incidence) => (
                  <tr
                    key={incidence.id}
                    className='incidence-row'
                  >
                    <td className='id-cell'>
                      #{incidence.id.toString().padStart(3, '0')}
                    </td>
                    <td className='date-cell'>
                      {formatDate(incidence.dateTimeIncident)}
                    </td>
                    <td className='type-cell'>{incidence.incidenceType}</td>
                    <td className='severity-cell'>
                      <span
                        className={`severity-badge ${incidence.severity.toLowerCase()}`}
                      >
                        {getSeverityIcon(incidence.severity)}{' '}
                        {incidence.severity}
                      </span>
                    </td>
                    <td className='status-cell'>
                      <span
                        className={`status-badge ${incidence.status.toLowerCase()}`}
                      >
                        {incidence.status}
                      </span>
                    </td>
                    <td className='bikerack-cell'>
                      {incidence.bikerack?.name || 'N/A'}
                    </td>
                    <td className='actions-cell'>
                      <button
                        onClick={() => openIncidenceDetails(incidence)}
                        className='btn-view'
                        title='Ver detalles'
                        disabled={loadingDetail} 
                      >
                        {loadingDetail ? 'Cargando...' : 'Ver'}
                      </button>
                      <button
                        onClick={() => handleDeleteIncidence(incidence.id)}
                        className='btn-delete'
                        title='Eliminar incidencia'
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* modal de detalles */}
      {showModal && selectedIncidence && (
        <IncidentDetailsModal
          incidence={selectedIncidence}
          onClose={() => {
            setShowModal(false);
            setSelectedIncidence(null);
          }}
        />
      )}
    </div>
  );
};

export default IncidentHistory;
