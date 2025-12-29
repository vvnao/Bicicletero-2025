import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import LayoutGuardia from '@components/guardia/LayoutGuardia';
import '@styles/HomeGuardia.css';

import {
  Monitor,
  AlertTriangle,
  ClipboardList,
  History,
  Shield,
  Clock,
  Bike,
  Eye,
  FileText,
  CheckCircle,
  Calendar,
  Zap,
} from 'lucide-react';

function HomeGuardia() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#0f172a';
    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.backgroundColor = '';
    };
  }, []);

  const goToMonitoring = () => navigate('/home/guardia/monitoring');
  const goToIncidentReports = () => navigate('/home/guardia/incident-reports');
  const goToPending = () => navigate('/home/guardia/pending-requests');
  const goToHistory = () => navigate('/home/guardia/reviews-history');

  return (
    <LayoutGuardia>
      <div className='home-guardia-container'>
        <div className='hero-section'>
          <div className='hero-overlay'>
            <div className='hero-content'>
              <h1 className='hero-title'>Bienvenido al Centro de Monitoreo</h1>
              <p className='hero-subtitle'>
                Tu atención hace la diferencia en la seguridad.
              </p>
              <div className='hero-stats'>
                <div className='stat-card'>
                  <div className='stat-icon'>
                    <Zap size={32} />
                  </div>
                  <span className='stat-number'>24/7</span>
                  <span className='stat-label'>Monitoreo Activo</span>
                </div>
                <div className='stat-card'>
                  <div className='stat-icon'>
                    <Shield size={32} />
                  </div>
                  <span className='stat-number'>100%</span>
                  <span className='stat-label'>Seguridad Garantizada</span>
                </div>
                <div className='stat-card'>
                  <div className='stat-icon'>
                    <Bike size={32} />
                  </div>
                  <span className='stat-number'>500+</span>
                  <span className='stat-label'>Bicicletas Protegidas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='quick-actions-section'>
          <h2 className='section-title'>Acciones Rápidas</h2>
          <p className='section-subtitle'>
            Gestiona las operaciones del día con un solo click
          </p>

          <div className='actions-grid'>
            <button
              onClick={goToMonitoring}
              className='action-card monitoring'
            >
              <div className='action-icon'>
                <Monitor size={36} />
              </div>
              <h3>Panel de Monitoreo</h3>
              <p>Supervisa bicicleteros en tiempo real</p>
              <div className='action-hint'>
                <Eye size={16} />
                Ver estado actual
                <span className='arrow'>→</span>
              </div>
            </button>

            <button
              onClick={goToIncidentReports}
              className='action-card incidents'
            >
              <div className='action-icon'>
                <AlertTriangle size={36} />
              </div>
              <h3>Reportar Incidentes</h3>
              <p>Registra y gestiona incidencias</p>
              <div className='action-hint'>
                <FileText size={16} />
                Crear reporte
                <span className='arrow'>→</span>
              </div>
            </button>

            <button
              onClick={goToPending}
              className='action-card pending'
            >
              <div className='action-icon'>
                <ClipboardList size={36} />
              </div>
              <h3>Solicitudes Pendientes</h3>
              <p>Revisa y aprueba solicitudes</p>
              <div className='action-hint'>
                <CheckCircle size={16} />
                Ver pendientes
                <span className='arrow'>→</span>
              </div>
            </button>

            <button
              onClick={goToHistory}
              className='action-card history'
            >
              <div className='action-icon'>
                <History size={36} />
              </div>
              <h3>Historial de Solicitudes</h3>
              <p>Consulta registros anteriores</p>
              <div className='action-hint'>
                <Calendar size={16} />
                Explorar
                <span className='arrow'>→</span>
              </div>
            </button>
          </div>
        </div>

        {/* WELCOME MESSAGE */}
        <div className='welcome-message'>
          <div className='welcome-content'>
            <h2>¡Buen día, Guardia!</h2>
            <p className='welcome-text'>
              Tu dedicación es fundamental para mantener la seguridad en
              nuestras instalaciones. Cada acción que realizas contribuye a un
              ambiente más seguro para todos los usuarios.
            </p>
            <div className='shift-info'>
              <span className='shift-badge'>
                <Shield size={18} />
                Turno Activo
              </span>
              <span className='time-info'>
                <Clock size={18} />
                {new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </LayoutGuardia>
  );
}

export default HomeGuardia;
