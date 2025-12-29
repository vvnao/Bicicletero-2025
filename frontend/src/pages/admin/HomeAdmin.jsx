import { useState, useEffect } from "react";
import LayoutAdmin from "../../components/admin/LayoutAdmin";
import dashboardService from "../../services/dashboard.service";
import ChartComponent from "../../components/admin/ChartComponent";

// Importar la imagen
import AdminImage from "../../assets/Admin.png";

function HomeAdmin() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [HomeAdmin] Cargando dashboard...');
      const data = await dashboardService.getDashboardData();
      console.log('✅ [HomeAdmin] Datos recibidos:', data);
      
      // Validar que los datos tienen la estructura esperada
      if (!data) {
        throw new Error('No se recibieron datos del servidor');
      }
      
      setDashboardData(data);
    } catch (err) {
      console.error('❌ [HomeAdmin] Error:', err);
      setError(err.message || 'Error desconocido al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Preparar datos para gráficos con validaciones
  const prepareChartData = () => {
    if (!dashboardData) return {};

    const { 
      capacity = [], 
      incidents = [], 
      activity = [], 
      metrics = {} 
    } = dashboardData;

    // 1. Gráfico de Capacidad (Barras apiladas)
    const capacityChartData = capacity.length > 0 ? {
      labels: capacity.map(bike => bike.name || 'Sin nombre'),
      datasets: [
        {
          label: 'Ocupado',
          data: capacity.map(bike => bike.ocupado || 0),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
        },
        {
          label: 'Disponible',
          data: capacity.map(bike => (bike.total || 0) - (bike.ocupado || 0)),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 2,
        }
      ]
    } : null;

    // 2. Gráfico de Incidentes (Barras)
    const incidentsChartData = incidents.length > 0 ? {
      labels: incidents.map(inc => inc.tipo || 'Desconocido'),
      datasets: [
        {
          label: 'Cantidad',
          data: incidents.map(inc => inc.cantidad || 0),
          backgroundColor: [
            'rgba(239, 68, 68, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(59, 130, 246, 0.7)',
          ],
          borderColor: [
            'rgb(239, 68, 68)',
            'rgb(245, 158, 11)',
            'rgb(59, 130, 246)',
          ],
          borderWidth: 1,
        }
      ]
    } : null;

    // 3. Gráfico de Actividad (Línea)
    const hoursToShow = 6;
    const recentActivity = activity.slice(0, hoursToShow);
    
    const activityChartData = recentActivity.length > 0 ? {
      labels: recentActivity.map(item => item.hora || ''),
      datasets: [
        {
          label: 'Ingresos',
          data: recentActivity.map(item => item.ingresos || 0),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.3,
          fill: true,
          borderWidth: 3,
        },
        {
          label: 'Salidas',
          data: recentActivity.map(item => item.salidas || 0),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
          fill: true,
          borderWidth: 3,
        }
      ]
    } : null;

    // 4. Gráfico de Ocupación por Bicicletero (Barras)
    const occupancyChartData = capacity.length > 0 ? {
      labels: capacity.map(bike => bike.name || 'Sin nombre'),
      datasets: [
        {
          label: 'Ocupación (%)',
          data: capacity.map(bike => Math.round(bike.porcentaje || 0)),
          backgroundColor: capacity.map(bike => {
            const pct = bike.porcentaje || 0;
            return pct > 80 ? 'rgba(239, 68, 68, 0.7)' :
                   pct > 60 ? 'rgba(245, 158, 11, 0.7)' :
                   'rgba(16, 185, 129, 0.7)';
          }),
          borderColor: capacity.map(bike => {
            const pct = bike.porcentaje || 0;
            return pct > 80 ? 'rgb(239, 68, 68)' :
                   pct > 60 ? 'rgb(245, 158, 11)' :
                   'rgb(16, 185, 129)';
          }),
          borderWidth: 1,
        }
      ]
    } : null;

    // 5. Gráfico de Resumen del Día (Dona)
    const summaryToday = metrics.summaryToday || {};
    const summaryChartData = {
      labels: ['Ingresos', 'Salidas', 'Activos'],
      datasets: [
        {
          label: 'Hoy',
          data: [
            summaryToday.ingresos || 0,
            summaryToday.salidas || 0,
            summaryToday.activos || 0,
          ],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(107, 114, 128, 0.8)',
          ],
          borderColor: [
            'rgb(16, 185, 129)',
            'rgb(59, 130, 246)',
            'rgb(107, 114, 128)',
          ],
          borderWidth: 2,
        }
      ]
    };

    return {
      capacityChartData,
      incidentsChartData,
      activityChartData,
      occupancyChartData,
      summaryChartData,
    };
  };

  const chartData = prepareChartData();

  // Estado de carga
  if (loading) {
    return (
      <LayoutAdmin>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Cargando dashboard...</p>
            <p className="text-gray-400 text-sm mt-2">Conectando con la base de datos</p>
          </div>
        </div>
      </LayoutAdmin>
    );
  }

  // Estado de error
  if (error) {
    return (
      <LayoutAdmin>
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white border-2 border-red-200 rounded-lg p-8 max-w-md w-full">
            <div className="text-center mb-4">
              <span className="text-6xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-red-800 mb-3 text-center">
              Error al cargar dashboard
            </h3>
            <p className="text-red-600 mb-4 text-center">{error}</p>
            <div className="space-y-2">
              <button 
                onClick={loadDashboard}
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                🔄 Reintentar
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Recargar página
              </button>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
              <p className="font-semibold mb-1">Posibles causas:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>El servidor backend no está ejecutándose</li>
                <li>Problemas de conexión a la base de datos</li>
                <li>La sesión ha expirado</li>
                <li>URL de la API incorrecta</li>
              </ul>
            </div>
          </div>
        </div>
      </LayoutAdmin>
    );
  }

  // Sin datos
  if (!dashboardData) {
    return (
      <LayoutAdmin>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <span className="text-6xl mb-4 block">📊</span>
            <p className="text-gray-600 text-lg">No hay datos disponibles</p>
            <button 
              onClick={loadDashboard}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Cargar datos
            </button>
          </div>
        </div>
      </LayoutAdmin>
    );
  }

  // Desestructurar datos con valores por defecto
  const { 
    metrics = {}, 
    capacity = [], 
    guards = [], 
    activity = [], 
    incidents = [] 
  } = dashboardData;

  const summaryToday = metrics.summaryToday || {};

  return (
    <LayoutAdmin>
      <div className="p-6">
        {/* Header con Bienvenida */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard Administrativo</h1>
            <p className="text-white text-sm mt-1">Vista general del sistema de bicicleteros</p>
          </div>
          <button
            onClick={loadDashboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>🔄</span>
            Actualizar
          </button>
        </div>

        {/* Rectángulo de Bienvenida con PNG */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row items-center p-6 md:p-8">
            <div className="flex-1 text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">¡Bienvenido, Administrador!</h2>
              <p className="text-blue-100 mb-4 max-w-2xl">
                Estás viendo el panel de control principal del sistema de bicicleteros. 
                Aquí puedes monitorear en tiempo real la ocupación, actividad, incidentes 
                y el desempeño general del sistema.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="bg-blue-500 bg-opacity-30 px-3 py-1 rounded-full text-sm font-medium">
                  📊 {capacity.length} Bicicleteros
                </span>
              </div>
            </div>
          <div className="mt-6 md:mt-0 md:ml-8 flex-shrink-0 w-full md:w-auto">
 {/* Usando clase personalizada */}
<div className="relative">
  <div className="w-full h-full flex items-center justify-center">
    <img 
  src={AdminImage} 
  alt="Administrador Sistema Bicicleteros"
  className="imagen-personalizada drop-shadow-lg"
  onError={(e) => {
    e.target.style.display = 'none';
    e.target.parentElement.innerHTML = `
      <div class="bg-white bg-opacity-10 rounded-lg backdrop-blur-sm border border-white border-opacity-20 imagen-personalizada flex items-center justify-center">
        <div class="text-center p-4">
          <span class="text-8xl mb-4 block">👨‍💼</span>
          <p class="text-white font-semibold text-lg">Panel de</p>
          <p class="text-white font-bold text-2xl">Administración</p>
        </div>
      </div>
    `;
  }}
/>
  </div>
</div>
</div>
          </div>
        </div>

        {/* Tarjetas de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Ingresos Hoy */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <span className="text-green-600 text-2xl">⬆️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Ingresos Hoy</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {summaryToday.ingresos || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Salidas Hoy */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <span className="text-blue-600 text-2xl">⬇️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Salidas Hoy</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {summaryToday.salidas || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Activos */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="rounded-full bg-gray-100 p-3 mr-4">
                <span className="text-gray-600 text-2xl">🚲</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Bicicletas Activas</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {summaryToday.activos || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Nueva tarjeta: Ocupación Promedio */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <span className="text-purple-600 text-2xl">📈</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Ocupación Promedio</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {capacity.length > 0 
                    ? Math.round(capacity.reduce((sum, bike) => sum + (bike.porcentaje || 0), 0) / capacity.length) 
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico 1: Capacidad de Bicicleteros */}
          {chartData.capacityChartData && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Capacidad de Bicicleteros</h2>
                <span className="text-sm text-gray-500">Ocupación vs Disponible</span>
              </div>
              <div className="h-80">
                <ChartComponent
                  type="bar"
                  data={chartData.capacityChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        stacked: true,
                      },
                      y: {
                        stacked: true,
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Cantidad de espacios'
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw;
                            const total = capacity[context.dataIndex]?.total || 0;
                            const percentage = total ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Total ocupados: {capacity.reduce((sum, bike) => sum + (bike.ocupado || 0), 0)}</span>
                  <span>Total disponibles: {capacity.reduce((sum, bike) => sum + ((bike.total || 0) - (bike.ocupado || 0)), 0)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Gráfico 2: Actividad Reciente */}
          {chartData.activityChartData && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Actividad por Hora</h2>
                <span className="text-sm text-gray-500">Últimas 6 horas</span>
              </div>
              <div className="h-80">
                <ChartComponent
                  type="line"
                  data={chartData.activityChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Cantidad de movimientos'
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'top',
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Gráfico 3: Ocupación por Bicicletero */}
          {chartData.occupancyChartData && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Porcentaje de Ocupación</h2>
                <span className="text-sm text-gray-500">Por bicicletero</span>
              </div>
              <div className="h-80">
                <ChartComponent
                  type="bar"
                  data={chartData.occupancyChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                          display: true,
                          text: 'Porcentaje (%)'
                        },
                        ticks: {
                          callback: function(value) {
                            return value + '%';
                          }
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.dataset.label}: ${context.raw}%`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {capacity.map(bike => (
                  <div key={bike.id} className="text-center">
                    <div className={`h-2 w-full rounded-full ${
                      (bike.porcentaje || 0) > 80 ? 'bg-red-500' :
                      (bike.porcentaje || 0) > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <p className="text-xs mt-1 font-medium">{bike.name}</p>
                    <p className="text-xs text-gray-500">{Math.round(bike.porcentaje || 0)}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gráfico 4: Resumen del Día */}
          {chartData.summaryChartData && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Resumen del Día</h2>
                <span className="text-sm text-gray-500">Hoy</span>
              </div>
              <div className="h-80">
                <ChartComponent
                  type="doughnut"
                  data={chartData.summaryChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm font-medium text-green-600">Ingresos</p>
                  <p className="text-xl font-bold">{summaryToday.ingresos || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Salidas</p>
                  <p className="text-xl font-bold">{summaryToday.salidas || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Activos</p>
                  <p className="text-xl font-bold">{summaryToday.activos || 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sección Inferior: Tablas y Listas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Guardias por Zona */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Guardias Asignados</h2>
            </div>
            <div className="p-6">
              {guards.length > 0 ? (
                <div className="space-y-4">
                  {guards.map((zone) => (
                    <div key={zone.bikerackId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-900">{zone.bikerackName}</h3>
                        <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                          {zone.guards.length} guardia(s)
                        </span>
                      </div>
                      {zone.guards.length > 0 ? (
                        <ul className="space-y-2">
                          {zone.guards.map((guard, idx) => (
                            <li key={idx} className="flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                              <span className="text-sm text-gray-700">{guard}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Sin guardias asignados</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-2 block">👮</span>
                  <p>No hay guardias registrados</p>
                </div>
              )}
            </div>
          </div>

          {/* Tipos de Incidentes */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Incidentes Registrados</h2>
            </div>
            <div className="p-6">
              {incidents.length > 0 && incidents.some(inc => (inc.cantidad || 0) > 0) ? (
                <div className="space-y-4">
                  {incidents.map((incident, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          incident.tipo === 'Robo' ? 'bg-red-500' :
                          incident.tipo === 'Daño' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}></div>
                        <span className="font-medium">{incident.tipo || 'Desconocido'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-2xl font-bold mr-2">{incident.cantidad || 0}</span>
                        <span className="text-sm text-gray-500">registros</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-2 block">✅</span>
                  <p>No hay incidentes registrados</p>
                  <p className="text-sm mt-1">Todo funcionando correctamente</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </LayoutAdmin>
  );
}

export default HomeAdmin;