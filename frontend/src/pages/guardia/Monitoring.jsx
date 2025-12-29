import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBikeracks } from '@services/bikerack.service';
import '@styles/Monitoring.css';

const Monitoring = () => {
  const [bikeracks, setBikeracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchBikeracks = async () => {
    setIsRefreshing(true);
    try {
      const data = await getBikeracks();
      const sortedData = orderBikeracks(data);
      setBikeracks(sortedData);
    } catch (error) {
      console.error('Error cargando monitoreo', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const orderBikeracks = (racks) => {
    const order = ['NORTE', 'SUR', 'ESTE', 'OESTE'];
    return [...racks].sort((a, b) => {
      const indexA = order.findIndex((dir) =>
        a.name.toUpperCase().includes(dir)
      );
      const indexB = order.findIndex((dir) =>
        b.name.toUpperCase().includes(dir)
      );
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  };

  const getOccupancyColor = (inUse, capacity) => {
    const percentage = (inUse / capacity) * 100;
    if (percentage >= 90) return 'full';
    if (percentage >= 70) return 'high';
    return '';
  };

  const formatUpdateTime = (timeString) => {
    if (!timeString) {
      return 'Sin datos de actualización';
    }

    try {
      const date = new Date(timeString);

      if (isNaN(date.getTime())) {
        return `Última actualización: ${timeString}`;
      }

      return `Última actualización: ${date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })}`;
    } catch (error) {
      return `Actualizado: ${timeString}`;
    }
  };

  useEffect(() => {
    fetchBikeracks();
    const interval = setInterval(fetchBikeracks, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className='monitoring-container'>
        <div
          className='skeleton'
          style={{ height: '90px', marginBottom: '2rem' }}
        ></div>
        <div className='bikeracks-grid'>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className='bikerack-card'
            >
              <div
                className='skeleton'
                style={{ height: '28px', width: '70%', marginBottom: '1rem' }}
              ></div>
              <div
                className='skeleton'
                style={{ height: '45px', width: '40%', marginBottom: '1rem' }}
              ></div>
              <div
                className='skeleton'
                style={{
                  height: '20px',
                  width: '100%',
                  marginBottom: '0.5rem',
                }}
              ></div>
              <div
                className='skeleton'
                style={{ height: '45px', width: '100%' }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='monitoring-container'>
      <header className='monitoring-header'>
        <div>
          <h1>🚴 Panel de Monitoreo</h1>
          <p
            style={{
              opacity: 0.9,
              fontSize: '0.9rem',
              marginTop: '0.5rem',
              color: 'var(--mon-text-secondary)',
            }}
          >
            {bikeracks.length} bicicleteros activos • Actualización automática
            cada 60 segundos
          </p>
        </div>
        <button
          className={`refresh-btn ${isRefreshing ? 'spinning' : ''}`}
          onClick={fetchBikeracks}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'Actualizando...' : 'Actualizar ahora'}
        </button>
      </header>

      <section className='bikeracks-grid'>
        {bikeracks.map((rack) => {
          const occupancyClass = getOccupancyColor(
            rack.totalInUse,
            rack.capacity
          );

          return (
            <div
              key={rack.id}
              className='bikerack-card'
            >
              <div className='card-main-info'>
                <h2>{rack.name}</h2>
                <span
                  className={`occupancy-badge ${occupancyClass}`}
                  title={`${rack.totalInUse} de ${rack.capacity} espacios ocupados`}
                >
                  {rack.totalInUse}/{rack.capacity}
                </span>
              </div>

              <p className='update-time'>{formatUpdateTime(rack.lastUpdate)}</p>

              <button
                className='view-details-btn'
                onClick={() => navigate(`/home/guardia/monitoring/${rack.id}`)}
                title={`Ver detalles de ${rack.name}`}
              >
                <span>Ver vista detallada</span>
              </button>
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default Monitoring;