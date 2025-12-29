import React, { useState, useEffect } from 'react';
import LayoutAdmin from '../../components/admin/LayoutAdmin';
import { 
  FileText, Download, AlertTriangle, CheckCircle, 
  Calendar, Filter, ChevronLeft, ChevronRight, Eye,
  BarChart, TrendingUp, Users, Bike, RefreshCw, MapPin,
  FileDown
} from 'lucide-react';
import { getToken } from '../../services/auth.service';
import reportsService from '../../services/reports.service';

function ReportesAdmin() {
  // Establecer semana actual por defecto
  const getDefaultWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Lunes de esta semana
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6); // Domingo de esta semana
    
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0]
    };
  };

  const defaultDates = getDefaultWeekDates();
  
  const [selectedStartDate, setSelectedStartDate] = useState(defaultDates.start);
  const [selectedEndDate, setSelectedEndDate] = useState(defaultDates.end);
  const [selectedBikerack, setSelectedBikerack] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  
  // Estados para datos
  const [reportData, setReportData] = useState(null);
  const [bikeracks, setBikeracks] = useState([]);

  // Cargar bicicleteros al montar
  useEffect(() => {
    fetchBikeracks();
  }, []);

  // Fetch bikeracks
  const fetchBikeracks = async () => {
    try {
      const token = getToken();
      const response = await fetch('/api/bikeracks', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBikeracks(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching bikeracks:', error);
    }
  };

  // Generar reporte
  const handleGenerateReport = async () => {
    // Validar fechas
    const validation = reportsService.validateReportDates(selectedStartDate, selectedEndDate);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors([]);
    setLoading(true);

    try {
      console.log('🔄 Generando reporte con:', {
        startDate: selectedStartDate,
        endDate: selectedEndDate,
        bikerackId: selectedBikerack || null
      });

      const result = await reportsService.generateBikerackReport({
        startDate: selectedStartDate,
        endDate: selectedEndDate,
        bikerackId: selectedBikerack || null
      });

      console.log('📊 Resultado:', result);

      if (result.success) {
        setReportData(result.data);
        setShowReport(true);
      } else {
        setErrors([result.message || 'Error al generar reporte']);
      }
    } catch (error) {
      console.error('❌ Error generating report:', error);
      setErrors([
        'Error inesperado al generar el reporte',
        'Detalles: ' + error.message,
        'Verifica que el servidor backend esté corriendo y que la ruta /api/reports/bikerack exista'
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar rango de fechas rápido
  const applyQuickDateRange = (range) => {
    const dates = reportsService.getDateRange(range);
    setSelectedStartDate(dates.startDate);
    setSelectedEndDate(dates.endDate);
  };

  // Limpiar formulario
  const handleClear = () => {
    const defaultDates = getDefaultWeekDates();
    setSelectedStartDate(defaultDates.start);
    setSelectedEndDate(defaultDates.end);
    setSelectedBikerack('');
    setShowReport(false);
    setReportData(null);
    setErrors([]);
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    if (!reportData) return;
    
    const result = reportsService.exportReportToCSV(reportData, 'reporte_bicicleteros');
    
    if (!result.success) {
      setErrors([result.message]);
    }
  };

  return (
    <LayoutAdmin>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BarChart className="w-8 h-8 text-indigo-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Reportes de Bicicleteros</h1>
                  <p className="text-gray-600">Ingresos y salidas de bicicletas</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>

          {/* Errores */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-red-800 font-semibold mb-1">Errores de validación</h3>
                  <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Panel de Configuración */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Configurar Reporte</h2>
              {selectedStartDate && selectedEndDate && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Rango seleccionado:</span>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-medium">
                    {new Date(selectedStartDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} 
                    {' - '}
                    {new Date(selectedEndDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={selectedStartDate}
                  onChange={(e) => setSelectedStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={selectedEndDate}
                  onChange={(e) => setSelectedEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Bicicletero (Opcional)
                </label>
                <select
                  value={selectedBikerack}
                  onChange={(e) => setSelectedBikerack(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Todos los bicicleteros</option>
                  {bikeracks.map(bikerack => (
                    <option key={bikerack.id} value={bikerack.id}>
                      {bikerack.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleGenerateReport}
                  disabled={loading || !selectedStartDate || !selectedEndDate}
                  className="w-full bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generando...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Generar
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Rangos rápidos */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => applyQuickDateRange('current-week')}
                className="px-4 py-2 bg-indigo-50 border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
              >
                📅 Semana Actual
              </button>
              
              <button
                onClick={() => applyQuickDateRange('week')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Últimos 7 días
              </button>
              
              <button
                onClick={() => applyQuickDateRange('month')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Último mes
              </button>

              <button
                onClick={() => applyQuickDateRange('previous-week')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Semana Anterior
              </button>
              
              <button
                onClick={handleClear}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm ml-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Limpiar
              </button>
            </div>
          </div>

          {/* Reporte Generado */}
          {showReport && reportData && (
            <div className="space-y-6">
              {/* Cabecera del Reporte */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">
                      {reportData.title || 'Reporte de Ingresos y Salidas'}
                    </h2>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{reportData.period?.formatted || 'Período no especificado'}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FileDown className="w-4 h-4" />
                      CSV
                    </button>
                    
                    <button
                      onClick={() => reportsService.exportReportToPDF()}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Imprimir
                    </button>
                  </div>
                </div>

                {/* Estadísticas Principales */}
                {reportData.summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-800">Total Movimientos</h3>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">
                        {reportData.summary.totalMovements || 0}
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Bike className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-green-800">Check-ins</h3>
                      </div>
                      <p className="text-2xl font-bold text-green-900">
                        {reportData.summary.totalCheckins || 0}
                      </p>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Bike className="w-5 h-5 text-orange-600" />
                        <h3 className="font-semibold text-orange-800">Check-outs</h3>
                      </div>
                      <p className="text-2xl font-bold text-orange-900">
                        {reportData.summary.totalCheckouts || 0}
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-purple-800">Usuarios Únicos</h3>
                      </div>
                      <p className="text-2xl font-bold text-purple-900">
                        {reportData.summary.uniqueUsers || 0}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Estadísticas Diarias */}
              {reportData.dailyStats && reportData.dailyStats.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 Estadísticas Diarias</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Check-ins</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Check-outs</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Usuarios</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.dailyStats.map((day, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-800 font-medium">
                              {day.date}
                            </td>
                            <td className="py-3 px-4 text-sm text-green-600 font-medium">
                              ↑ {day.checkins}
                            </td>
                            <td className="py-3 px-4 text-sm text-blue-600 font-medium">
                              ↓ {day.checkouts}
                            </td>
                            <td className="py-3 px-4 text-sm text-purple-600 font-medium">
                              {day.uniqueUsers}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-800 font-bold">
                              {day.total}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Estadísticas por Bicicletero */}
              {reportData.bikerackStats && reportData.bikerackStats.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">📍 Uso por Bicicletero</h3>
                  <div className="space-y-3">
                    {reportData.bikerackStats.map((bikerack, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">
                            {index + 1}. {bikerack.name}
                          </h4>
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                            {bikerack.percentage}% del total
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Check-ins</p>
                            <p className="font-bold text-green-600">↑ {bikerack.checkins}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Check-outs</p>
                            <p className="font-bold text-blue-600">↓ {bikerack.checkouts}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Usuarios</p>
                            <p className="font-bold text-purple-600">{bikerack.uniqueUsers}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total</p>
                            <p className="font-bold text-gray-800">{bikerack.total}</p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${bikerack.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Movimientos Detallados */}
              {reportData.movements && reportData.movements.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Movimientos Detallados</h3>
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-gray-50">
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Fecha/Hora</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Tipo</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Usuario</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Bicicleta</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Bicicletero</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.movements.slice(0, 50).map((movement, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2 px-3 text-gray-600">
                              {new Date(movement.createdAt).toLocaleString('es-ES')}
                            </td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                movement.historyType === 'CHECKIN' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {movement.historyType === 'CHECKIN' ? '↑ Ingreso' : '↓ Salida'}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-gray-800">
                              {movement.user?.names || 'N/A'} {movement.user?.lastName || ''}
                            </td>
                            <td className="py-2 px-3 text-gray-600">
                              {movement.bicycle?.code || 'N/A'}
                            </td>
                            <td className="py-2 px-3 text-gray-600">
                              {movement.bikerack?.name || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {reportData.movements.length > 50 && (
                      <p className="text-center text-gray-500 text-sm mt-4">
                        Mostrando 50 de {reportData.movements.length} movimientos
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Estado vacío */}
          {!showReport && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay reporte generado</h3>
              <p className="text-gray-600">Selecciona un rango de fechas y genera un reporte</p>
            </div>
          )}
        </div>
      </div>
    </LayoutAdmin>
  );
}

export default ReportesAdmin;