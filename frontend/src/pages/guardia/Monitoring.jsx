import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBikeracks } from '@services/bikerack.service';
import { Bike, RefreshCw } from 'lucide-react';
import '@styles/Monitoring.css';

const Monitoring = () => {
  const [bikeracks, setBikeracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchBikeracks = async () => {
    setRefreshing(true);
    try {
      const data = await getBikeracks();
      const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
      setBikeracks(sorted);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getOccupancyPercentage = (inUse, capacity) => {
    return capacity > 0 ? Math.round((inUse / capacity) * 100) : 0;
  };

  const getOccupancyStatus = (percentage) => {
    if (percentage >= 90) return 'full';
    if (percentage >= 70) return 'high';
    return 'normal';
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'null' || dateString === 'undefined') {
      return 'Sin datos de actualización';
    }

    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return `Actualizado: ${dateString}`;
      }

      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      //* menos de 24 horas
      if (diffHours < 24) {
        return `hace ${diffHours} h`;
      }

      //*24 horas o más
      const diffDays = Math.floor(diffHours / 24);
      return diffDays === 1 ? 'hace 1 día' : `hace ${diffDays} días`;
    } catch (error) {
      return 'Sin datos';
    }
  };

  useEffect(() => {
    fetchBikeracks();
    const interval = setInterval(fetchBikeracks, 80000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className='monitoring-container'>
        <div className='monitoring-loading'>
          <div className='loading-spinner'></div>
          <p>Cargando bicicleteros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='monitoring-container'>
      {/* header */}
      <div className='monitoring-header'>
        <div className='header-title-wrapper'>
          <Bike
            size={24}
            className='bike-icon'
          />
          <h1>Panel de Monitoreo</h1>
        </div>

        <button
          className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
          onClick={fetchBikeracks}
          disabled={refreshing}
        >
          <RefreshCw
            size={16}
            className={`refresh-icon ${refreshing ? 'spin' : ''}`}
          />
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* grid bicicleteros */}
      <div className='bikeracks-grid'>
        {bikeracks.map((rack) => {
          const percentage = getOccupancyPercentage(
            rack.totalInUse,
            rack.capacity
          );
          const status = getOccupancyStatus(percentage);

          return (
            <div
              key={rack.id}
              className='bikerack-card'
            >
              <div className='card-header'>
                <h2>{rack.name}</h2>
                <div className={`occupancy-badge ${status}`}>
                  {rack.totalInUse}/{rack.capacity}
                </div>
              </div>

              <div className='card-info'>
                <p className='update-time'>
                  Última actualización: {formatDate(rack.lastUpdate)}
                </p>
              </div>

              <button
                className='details-btn'
                onClick={() => navigate(`/home/guardia/monitoring/${rack.id}`)}
              >
                Ver vista detallada →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Monitoring;
