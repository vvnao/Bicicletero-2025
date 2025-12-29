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

  const handleOpenModal = (spaceId) => {
    setSelectedSpaceId(spaceId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSpaceId(null);
    fetchInfo(false);
  };

  if (loading) {
    return (
      <div className='loading-screen'>
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            background: 'rgba(30, 41, 59, 0.9)',
            borderRadius: 'var(--mon-radius-lg)',
            border: '1px solid var(--mon-border-color)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
          <div>Cargando mapa de espacios...</div>
        </div>
      </div>
    );
  }

  if (!data)
    return (
      <div className='detail-container'>
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            background: 'var(--mon-card-bg)',
            borderRadius: 'var(--mon-radius-lg)',
            border: '1px solid var(--mon-border-color)',
            backdropFilter: 'blur(15px)',
            margin: '2rem auto',
            maxWidth: '500px',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
          <h2>No se encontró la información del bicicletero</h2>
          <button
            className='back-btn'
            onClick={() => navigate('/home/guardia/monitoring')}
            style={{ marginTop: '1.5rem' }}
          >
            ← Volver al panel
          </button>
        </div>
      </div>
    );

  const { bikerack, spaces, spaceCounts } = data;

  const totalSpaces = spaces.length;
  const occupancyPercentage =
    totalSpaces > 0
      ? Math.round(
          ((spaceCounts.occupied + spaceCounts.reserved + spaceCounts.overdue) /
            totalSpaces) *
            100
        )
      : 0;

  return (
    <div className='detail-container'>
      <header className='detail-header'>
        <div className='header-info'>
          <button
            className='back-btn'
            onClick={() => navigate('/home/guardia/monitoring')}
          >
            ← Volver al panel
          </button>
          <h1>
            <span style={{ marginRight: '0.5rem' }}></span>
            {bikerack.name}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              textAlign: 'right',
              color: 'var(--mon-text-secondary)',
              fontSize: '0.9rem',
            }}
          >
            <div>Capacidad: {totalSpaces} espacios</div>
            <div>Actualización automática cada 60s</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}></div>
          </div>

          <button
            className={`refresh-detail-btn ${isRefreshing ? 'loading' : ''}`}
            onClick={() => fetchInfo(false)}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </header>

      <section className='summary-bar'>
        <span style={{ color: 'var(--mon-success)' }}>
          <span style={{ fontSize: '1.2rem' }}></span> Libre: {spaceCounts.free}
        </span>
        <span style={{ color: 'var(--mon-warning)' }}>
          <span style={{ fontSize: '1.2rem' }}></span> Reservado:{' '}
          {spaceCounts.reserved}
        </span>
        <span style={{ color: 'var(--mon-danger)' }}>
          <span style={{ fontSize: '1.2rem' }}></span> Ocupado:{' '}
          {spaceCounts.occupied}
        </span>
        <span style={{ color: 'var(--mon-orange)' }}>
          <span style={{ fontSize: '1.2rem' }}></span> Infracción:{' '}
          {spaceCounts.overdue}
        </span>
      </section>

      <div className='grid-map'>
        {spaces.map((space) => (
          <div
            key={space.id}
            className={`space-box status-${space.status
              .toLowerCase()
              .replace(/\s+/g, '-')}`}
            onClick={() => handleOpenModal(space.id)}
            title={`Espacio ${space.spaceCode} - ${space.status}`}
          >
            {space.spaceCode}
            <div
              style={{
                position: 'absolute',
                bottom: '4px',
                fontSize: '0.7rem',
                opacity: 0.8,
              }}
            ></div>
          </div>
        ))}
      </div>

      <div
        style={{
          textAlign: 'center',
          marginTop: 'var(--mon-spacing-md)',
          color: 'var(--mon-text-muted)',
          fontSize: '0.9rem',
          padding: '0.75rem',
          background: 'rgba(15, 23, 42, 0.5)',
          borderRadius: 'var(--mon-radius-md)',
          border: '1px solid var(--mon-border-light)',
        }}
      >
        Haz clic en cualquier espacio para ver detalles
      </div>

      {/* Modal */}
      {isModalOpen && (
        <SpaceModal
          spaceId={selectedSpaceId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default BikerackDetail;
