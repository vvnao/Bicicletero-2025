import { useEffect, useState } from 'react';
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
      setBikeracks(data);
    } catch (error) {
      console.error('Error cargando monitoreo', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBikeracks();
    const interval = setInterval(fetchBikeracks, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Cargando panel de monitoreo...</p>;

  return (
    <div className='monitoring-container'>
      <header className='monitoring-header'>
        <h1>PANEL DE MONITOREO</h1>
        <button
          className={`refresh-btn ${isRefreshing ? 'spinning' : ''}`}
          onClick={fetchBikeracks}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'Actualizando...' : 'Actualizar ahora'}
        </button>
      </header>

      <section className='bikeracks-grid'>
        {bikeracks.map((rack) => (
          <div
            key={rack.id}
            className='bikerack-card'
          >
            <div className='card-main-info'>
              <h2>{rack.name}</h2>
              <span
                className={`occupancy-badge ${
                  rack.totalInUse >= rack.capacity ? 'full' : ''
                }`}
              >
                [{rack.totalInUse}/{rack.capacity}]
              </span>
            </div>
            <p className='update-time'>
              Última actualización: {rack.lastUpdate}
            </p>
            <button
              className='view-details-btn'
              onClick={() => navigate(`/home/guardia/monitoring/${rack.id}`)}
            >
              Ver vista detallada
            </button>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Monitoring;
