import { useEffect, useRef } from 'react';
import { 
  Chart, 
  BarController, 
  LineController, 
  PieController, 
  DoughnutController,
  RadarController,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Legend,
  Tooltip,
  Title 
} from 'chart.js';

// Registrar todos los componentes necesarios
Chart.register(
  BarController,
  LineController,
  PieController,
  DoughnutController,
  RadarController,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Legend,
  Tooltip,
  Title
);

function ChartComponent({ type, data, options, height = '300px' }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !data) return;

    // Destruir gráfico anterior si existe
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Configuración específica para gráficos horizontales
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      ...options,
    };

    // Para gráficos de barras horizontales
    if (type === 'horizontalBar') {
      chartOptions.indexAxis = 'y';
      chartOptions.scales = {
        x: {
          beginAtZero: true,
        },
        ...chartOptions.scales,
      };
    }

    // Crear nuevo gráfico
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: type === 'horizontalBar' ? 'bar' : type, // Mapear horizontalBar a bar
      data,
      options: chartOptions,
    });

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data, options]);

  return <canvas ref={chartRef} style={{ height }} />;
}

export default ChartComponent;