import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  History,
  Filter,
  Calendar,
  AlertCircle,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  getMyIncidenceReports,
  getIncidenceFormOptions,
  deleteIncidence,
  getIncidenceDetail,
} from '../../services/incident.service';
import IncidentDetailsModal from './IncidentDetailsModal';
import '@styles/IncidentHistory.css';

const IncidentHistory = () => {
  //* Estados principales
  const [historyIncidences, setHistoryIncidences] = useState([]);
  const [filteredHistoryIncidences, setFilteredHistoryIncidences] = useState(
    []
  );
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selectedHistoryIncidence, setSelectedHistoryIncidence] =
    useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [loadingHistoryDetail, setLoadingHistoryDetail] = useState(false);

  //* Estados para filtros
  const [formOptionsHistory, setFormOptionsHistory] = useState({
    types: [],
    severities: [],
    bikeracks: [],
  });

  const [historyFilters, setHistoryFilters] = useState({
    startDate: null,
    endDate: null,
    type: 'all',
    severity: 'all',
    status: 'all',
  });

  //* Estados para expandir/contraer filtros
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  //* Cargar datos iniciales
  useEffect(() => {
    const loadAllHistoryData = async () => {
      try {
        setLoadingHistory(true);
        const incidencesData = await getMyIncidenceReports();
        setHistoryIncidences(incidencesData);
        setFilteredHistoryIncidences(incidencesData);

        const optionsData = await getIncidenceFormOptions();
        setFormOptionsHistory(optionsData);
      } catch (error) {
        console.error('Error cargando datos históricos:', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadAllHistoryData();
  }, []);

  //* Aplicar filtros cuando cambian
  useEffect(() => {
    applyHistoryFilters();
  }, [historyIncidences, historyFilters]);

  //* Para recargar incidencias
  const reloadHistoryIncidences = async () => {
    try {
      const data = await getMyIncidenceReports();
      setHistoryIncidences(data);
      setFilteredHistoryIncidences(data);
    } catch (error) {
      console.error('Error recargando incidencias históricas:', error);
    }
  };

  //* eliminación de incidencia
  const handleDeleteHistoryIncidence = async (incidenceId) => {
    const confirmMessage = `¿Estás seguro de que deseas eliminar la incidencia #${incidenceId
      ?.toString()
      .padStart(3, '0')}?\n\nEsta acción no se puede deshacer.`;

    const isConfirmed = window.confirm(confirmMessage);

    if (!isConfirmed) {
      return;
    }

    try {
      await deleteIncidence(incidenceId);
      await reloadHistoryIncidences();
    } catch (error) {
      console.error('Error al eliminar incidencia histórica:', error);
      alert('Error al eliminar la incidencia. Por favor, inténtalo de nuevo.');
    }
  };

  //* Abrir detalles de incidencia
  const openHistoryIncidenceDetails = async (incidence) => {
    try {
      setLoadingHistoryDetail(true);
      setSelectedHistoryIncidence(null);

      const incidenceDetail = await getIncidenceDetail(incidence.id);

      setTimeout(() => {
        setSelectedHistoryIncidence(incidenceDetail);
        setShowHistoryModal(true);
      }, 50);
    } catch (error) {
      console.error('Error obteniendo detalles históricos:', error);

      setTimeout(() => {
        setSelectedHistoryIncidence(incidence);
        setShowHistoryModal(true);
      }, 50);
    } finally {
      setTimeout(() => {
        setLoadingHistoryDetail(false);
      }, 100);
    }
  };

  const applyHistoryFilters = () => {
    let filtered = [...historyIncidences];

    if (historyFilters.startDate) {
      filtered = filtered.filter(
        (inc) => new Date(inc.dateTimeIncident) >= historyFilters.startDate
      );
    }

    if (historyFilters.endDate) {
      const endDate = new Date(historyFilters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (inc) => new Date(inc.dateTimeIncident) <= endDate
      );
    }

    if (historyFilters.type !== 'all') {
      filtered = filtered.filter(
        (inc) => inc.incidenceType === historyFilters.type
      );
    }

    if (historyFilters.severity !== 'all') {
      filtered = filtered.filter(
        (inc) => inc.severity === historyFilters.severity
      );
    }

    if (historyFilters.status !== 'all') {
      filtered = filtered.filter((inc) => inc.status === historyFilters.status);
    }

    setFilteredHistoryIncidences(filtered);
  };

  const handleHistoryFilterChange = (key, value) => {
    setHistoryFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetHistoryFilters = () => {
    setHistoryFilters({
      startDate: null,
      endDate: null,
      type: 'all',
      severity: 'all',
      status: 'all',
    });
  };

  //* Formatear fecha
  const formatHistoryDate = (dateString) => {
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

  const getHistorySeverityIcon = (severity) => {
    switch (severity) {
      case 'Alta':
        return <AlertCircle className='history-severity-icon history-high' />;
      case 'Media':
        return (
          <AlertTriangle className='history-severity-icon history-medium' />
        );
      case 'Baja':
        return <Info className='history-severity-icon history-low' />;
      default:
        return <Info className='history-severity-icon' />;
    }
  };

  const getHistoryStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'abierta':
        return (
          <AlertCircle className='history-status-icon history-status-open' />
        );
      case 'en proceso':
        return <Clock className='history-status-icon history-status-process' />;
      case 'resuelta':
        return (
          <CheckCircle className='history-status-icon history-status-resolved' />
        );
      case 'cerrada':
        return (
          <CheckCircle className='history-status-icon history-status-closed' />
        );
      default:
        return <Info className='history-status-icon' />;
    }
  };

  const uniqueHistoryTypes = [
    ...new Set(historyIncidences.map((i) => i.incidenceType)),
  ];
  const uniqueHistorySeverities = [
    ...new Set(historyIncidences.map((i) => i.severity)),
  ];
  const uniqueHistoryStatuses = [
    ...new Set(historyIncidences.map((i) => i.status)),
  ];

  if (loadingHistory) {
    return (
      <div className='history-loading-container'>
        <div className='history-spinner'></div>
        <p>Cargando historial de incidencias...</p>
      </div>
    );
  }

  return (
    <div className='history-main-container'>
      {/* Encabezado */}
      <div className='history-header-section'>
        <h1 className='history-title'>
          <History className='history-title-icon' />
          Historial de Reportes
        </h1>

        <div className='history-summary'>
          <span className='history-summary-item'>
            <span className='history-summary-label'>Total:</span>
            <span className='history-summary-value'>
              {historyIncidences.length}
            </span>
          </span>
          <span className='history-summary-item'>
            <span className='history-summary-label'>Mostrando:</span>
            <span className='history-summary-value'>
              {filteredHistoryIncidences.length}
            </span>
          </span>
        </div>
      </div>

      {/* Sección de Filtros */}
      <div className='history-filters-container'>
        <div
          className='history-filters-header'
          onClick={() => setFiltersExpanded(!filtersExpanded)}
        >
          <Filter className='history-filters-icon' />
          <h2 className='history-filters-title'>Filtros</h2>
          {filtersExpanded ? (
            <ChevronUp className='history-expand-icon' />
          ) : (
            <ChevronDown className='history-expand-icon' />
          )}
        </div>

        {filtersExpanded && (
          <>
            <div className='history-filters-grid'>
              <div className='history-filter-group'>
                <label className='history-filter-label'>
                  <Calendar className='history-filter-icon' />
                  Fecha desde
                </label>
                <DatePicker
                  selected={historyFilters.startDate}
                  onChange={(date) =>
                    handleHistoryFilterChange('startDate', date)
                  }
                  dateFormat='dd/MM/yyyy'
                  placeholderText='DD/MM/AAAA'
                  className='history-filter-input'
                  isClearable
                />
              </div>

              <div className='history-filter-group'>
                <label className='history-filter-label'>
                  <Calendar className='history-filter-icon' />
                  Fecha hasta
                </label>
                <DatePicker
                  selected={historyFilters.endDate}
                  onChange={(date) =>
                    handleHistoryFilterChange('endDate', date)
                  }
                  dateFormat='dd/MM/yyyy'
                  placeholderText='DD/MM/AAAA'
                  className='history-filter-input'
                  isClearable
                />
              </div>

              <div className='history-filter-group'>
                <label className='history-filter-label'>Tipo</label>
                <select
                  value={historyFilters.type}
                  onChange={(e) =>
                    handleHistoryFilterChange('type', e.target.value)
                  }
                  className='history-filter-select'
                >
                  <option value='all'>Todos los tipos</option>
                  {uniqueHistoryTypes.map((type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className='history-filter-group'>
                <label className='history-filter-label'>Gravedad</label>
                <select
                  value={historyFilters.severity}
                  onChange={(e) =>
                    handleHistoryFilterChange('severity', e.target.value)
                  }
                  className='history-filter-select'
                >
                  <option value='all'>Todas las gravedades</option>
                  {uniqueHistorySeverities.map((sev) => (
                    <option
                      key={sev}
                      value={sev}
                    >
                      {sev}
                    </option>
                  ))}
                </select>
              </div>

              <div className='history-filter-group'>
                <label className='history-filter-label'>Estado</label>
                <select
                  value={historyFilters.status}
                  onChange={(e) =>
                    handleHistoryFilterChange('status', e.target.value)
                  }
                  className='history-filter-select'
                >
                  <option value='all'>Todos los estados</option>
                  {uniqueHistoryStatuses.map((status) => (
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

            <div className='history-filter-actions'>
              <button
                onClick={applyHistoryFilters}
                className='history-button history-button-apply'
              >
                Aplicar Filtros
              </button>
              <button
                onClick={resetHistoryFilters}
                className='history-button history-button-reset'
              >
                Limpiar Filtros
              </button>
            </div>
          </>
        )}
      </div>

      {/* Sección de Tabla */}
      <div className='history-table-section'>
        <div className='history-table-header'>
          <h2 className='history-table-title'>
            <AlertCircle className='history-table-icon' />
            Reportes Registrados
          </h2>
          <span className='history-table-counter'>
            {filteredHistoryIncidences.length} incidencias
          </span>
        </div>

        <div className='history-table-container'>
          <table className='history-table'>
            <thead>
              <tr>
                <th className='history-th-id'>ID</th>
                <th className='history-th-date'>Fecha Incidente</th>
                <th className='history-th-type'>Tipo</th>
                <th className='history-th-severity'>Gravedad</th>
                <th className='history-th-status'>Estado</th>
                <th className='history-th-bikerack'>Bicicletero</th>
                <th className='history-th-actions'>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredHistoryIncidences.length === 0 ? (
                <tr>
                  <td
                    colSpan='7'
                    className='history-no-data'
                  >
                    <div className='history-empty-state'>
                      <AlertCircle className='history-empty-icon' />
                      <p>
                        No hay incidencias que coincidan con los filtros
                        seleccionados
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHistoryIncidences.map((incidence) => (
                  <tr
                    key={incidence.id}
                    className='history-table-row'
                  >
                    <td className='history-td-id'>
                      <span className='history-id-badge'>
                        #{incidence.id.toString().padStart(3, '0')}
                      </span>
                    </td>

                    <td className='history-td-date'>
                      <Clock className='history-date-icon' />
                      {formatHistoryDate(incidence.dateTimeIncident)}
                    </td>

                    <td className='history-td-type'>
                      {incidence.incidenceType}
                    </td>

                    <td className='history-td-severity'>
                      <div className='history-severity-badge'>
                        {getHistorySeverityIcon(incidence.severity)}
                        <span
                          className={`history-severity-text history-${incidence.severity.toLowerCase()}`}
                        >
                          {incidence.severity}
                        </span>
                      </div>
                    </td>

                    <td className='history-td-status'>
                      <div className='history-status-badge'>
                        {getHistoryStatusIcon(incidence.status)}
                        <span
                          className={`history-status-text history-status-${incidence.status
                            .toLowerCase()
                            .replace(' ', '-')}`}
                        >
                          {incidence.status}
                        </span>
                      </div>
                    </td>

                    <td className='history-td-bikerack'>
                      {incidence.bikerack?.name || 'N/A'}
                    </td>

                    <td className='history-td-actions'>
                      <div className='history-actions-container'>
                        <button
                          onClick={() => openHistoryIncidenceDetails(incidence)}
                          className='history-button history-button-view'
                          title='Ver detalles'
                          disabled={loadingHistoryDetail}
                        >
                          <Eye className='history-action-icon' />
                          {loadingHistoryDetail ? 'Cargando...' : 'Ver'}
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteHistoryIncidence(incidence.id)
                          }
                          className='history-button history-button-delete'
                          title='Eliminar incidencia'
                        >
                          <Trash2 className='history-action-icon' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalles */}
      {showHistoryModal && selectedHistoryIncidence && (
        <IncidentDetailsModal
          incidence={selectedHistoryIncidence}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedHistoryIncidence(null);
          }}
        />
      )}
    </div>
  );
};

export default IncidentHistory;