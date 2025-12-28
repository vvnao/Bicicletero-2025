import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBikerackDetail } from '@services/bikerack.service';
import SpaceModal from './SpaceModal';
import '@styles/BikerackDetail.css';

const BikerackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSpaceId, setSelectedSpaceId] = useState(null);

  const fetchInfo = useCallback(
    async (showLoading = false) => {
      if (showLoading) setLoading(true);
      setIsRefreshing(true);
      try {
        const result = await getBikerackDetail(id);
        setData(result);
      } catch (error) {
        console.error('Error cargando detalle', error);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchInfo(true);
    const interval = setInterval(() => fetchInfo(false), 60000);
    return () => clearInterval(interval);
  }, [fetchInfo]);

  //! para el modal
  const handleOpenModal = (spaceId) => {
    setSelectedSpaceId(spaceId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSpaceId(null);
    fetchInfo(false);
  };

  if (loading)
    return <div className='loading-screen'>Cargando mapa de espacios...</div>;
  if (!data) return <p>No se encontró la información del bicicletero.</p>;

  const { bikerack, spaces, spaceCounts } = data;

  return (
    <div className='detail-container'>
      <header className='detail-header'>
        <div className='header-info'>
          <button
            className='back-btn'
            onClick={() => navigate('/home/guardia/monitoring')}
          >
            ← Volver
          </button>
          <h1>{bikerack.name}</h1>
        </div>

        <button
          className={`refresh-detail-btn ${isRefreshing ? 'loading' : ''}`}
          onClick={() => fetchInfo(false)}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'Actualizando...' : 'Actualizar Mapa'}
        </button>
      </header>

      <section className='summary-bar'>
        <span>🟢 Libre: {spaceCounts.free}</span>
        <span>🟡 Reservado: {spaceCounts.reserved}</span>
        <span>🔴 Ocupado: {spaceCounts.occupied}</span>
        <span>🟠 Infracción: {spaceCounts.overdue}</span>
      </section>

      <div className='grid-map'>
        {spaces.map((space) => (
          <div
            key={space.id}
            className={`space-box status-${space.status
              .toLowerCase()
              .replace(/\s+/g, '-')}`}
            onClick={() => handleOpenModal(space.id)}
          >
            {space.spaceCode}
          </div>
        ))}
      </div>

      //! modal
      {isModalOpen && (
        <SpaceModal
          spaceId={selectedSpaceId}
          onClose={handleCloseModal}
        />
      )}

      <footer className='legend'>
        <p>
          LEYENDA: 🟢 Libre | 🟡 Reservado | 🔴 Ocupado | 🟠 Tiempo Excedido
        </p>
      </footer>
    </div>
  );
};

export default BikerackDetail;
