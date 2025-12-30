import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBikerackDetail } from '@services/bikerack.service';
import SpaceModal from './SpaceModal';
import { RefreshCw } from 'lucide-react';
import '@styles/BikerackDetail.css';

const BikerackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bikerackData, setBikerackData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [modalData, setModalData] = useState({
    isOpen: false,
    spaceId: null,
  });

  const fetchData = useCallback(
    async (showLoading = false) => {
      if (showLoading) setIsLoading(true);
      setIsRefreshing(true);

      try {
        const result = await getBikerackDetail(id);
        setBikerackData(result);
      } catch (error) {
        console.error('Error cargando detalle', error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleOpenModal = (spaceId) => {
    setModalData({ isOpen: true, spaceId });
  };

  const handleCloseModal = () => {
    setModalData({ isOpen: false, spaceId: null });
  };

  if (isLoading) {
    return <div className='loading-screen'>Cargando mapa de espacios...</div>;
  }

  if (!bikerackData) {
    return (
      <p className='error-message'>
        No se encontró la información del bicicletero.
      </p>
    );
  }

  const { bikerack, spaces, spaceCounts } = bikerackData;

  return (
    <div className='detail-container'>
      <header className='detail-header'>
        <div className='header-info'>
          <button
            className='back-btn'
            onClick={() => navigate('/home/guardia/monitoring')}
            aria-label='Volver al panel'
          >
            ← Volver al Panel
          </button>
          <h1 className='bikerack-title'>{bikerack.name}</h1>
        </div>

        <div className='refresh-section'>
          <button
            className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
            onClick={() => fetchData(false)}
            disabled={isRefreshing}
            aria-label={isRefreshing ? 'Actualizando...' : 'Actualizar mapa'}
          >
            <RefreshCw
              size={16}
              className={`refresh-icon ${isRefreshing ? 'spin' : ''}`}
            />
            {isRefreshing ? 'Actualizando...' : 'Actualizar Mapa'}
          </button>
        </div>
      </header>

      <section className='stats-container'>
        <div className='stat-card stat-free'>
          <div className='stat-content'>
            <span className='stat-value'>{spaceCounts.free}</span>
            <span className='stat-label'>Libre</span>
          </div>
        </div>
        <div className='stat-card stat-reserved'>
          <div className='stat-content'>
            <span className='stat-value'>{spaceCounts.reserved}</span>
            <span className='stat-label'>Reservado</span>
          </div>
        </div>
        <div className='stat-card stat-occupied'>
          <div className='stat-content'>
            <span className='stat-value'>{spaceCounts.occupied}</span>
            <span className='stat-label'>Ocupado</span>
          </div>
        </div>
        <div className='stat-card stat-overdue'>
          <div className='stat-content'>
            <span className='stat-value'>{spaceCounts.overdue}</span>
            <span className='stat-label'>Infracción</span>
          </div>
        </div>
      </section>

      <div className='grid-container'>
        {spaces.map((space) => (
          <button
            key={space.id}
            className={`space-card status-${space.status
              .toLowerCase()
              .replace(/\s+/g, '-')}`}
            onClick={() => handleOpenModal(space.id)}
            aria-label={`Espacio ${space.spaceCode} - Estado: ${space.status}`}
          >
            {space.spaceCode}
          </button>
        ))}
      </div>

      <footer className='instruction-footer'>
        <p className='instruction-text'>
          Haz click en cualquier espacio para ver detalles
        </p>
      </footer>

      {modalData.isOpen && (
        <SpaceModal
          spaceId={modalData.spaceId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default BikerackDetail;