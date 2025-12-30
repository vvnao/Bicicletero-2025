import { useNavigate } from 'react-router-dom';
import LayoutGuardia from '@components/guardia/LayoutGuardia';
import '@styles/HomeGuardia.css';

import {
  Monitor,
  AlertTriangle,
  ClipboardList,
  History,
  Shield,
  Clock,
} from 'lucide-react';

function HomeGuardia() {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Panel de Monitoreo',
      description: 'Supervisa en tiempo real',
      icon: <Monitor size={24} />,
      path: '/home/guardia/monitoring',
      color: '#3b82f6',
    },
    {
      title: 'Reportar Incidentes',
      description: 'Registra incidencias',
      icon: <AlertTriangle size={24} />,
      path: '/home/guardia/incident-reports',
      color: '#ef4444',
    },
    {
      title: 'Solicitudes Pendientes',
      description: 'Revisa y aprueba',
      icon: <ClipboardList size={24} />,
      path: '/home/guardia/pending-requests',
      color: '#f59e0b',
    },
    {
      title: 'Historial',
      description: 'Consulta registros',
      icon: <History size={24} />,
      path: '/home/guardia/reviews-history',
      color: '#10b981',
    },
  ];

  return (
    <LayoutGuardia>
      <div className='home-guardia'>
        {/* Header simple */}
        <div className='header-simple'>
          <h1>Centro de Monitoreo</h1>
          <p>Tu atención hace la diferencia en la seguridad.</p>
        </div>

        {/* Contenido principal */}
        <div className='contenido-principal'>
          {/* Saludo y bienvenida */}
          <div className='saludo-section'>
            <div className='saludo-card'>
              <div className='saludo-header'>
                <Shield size={28} />
                <h2>¡Buen día, Guardia!</h2>
              </div>
              <p className='saludo-text'>
                Tu dedicación es fundamental para mantener la seguridad en
                nuestras instalaciones. Cada acción que realizas contribuye a un
                ambiente más seguro para todos los usuarios.
              </p>
              <div className='turno-info'>
                <div className='hora-actual'>
                  <Clock size={16} />
                  <span>
                    {new Date().toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className='acciones-section'>
            <h3>Acciones Rápidas</h3>
            <p>Gestiona las operaciones del día</p>

            <div className='acciones-grid'>
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className='accion-card'
                  onClick={() => navigate(action.path)}
                >
                  <div
                    className='accion-icono'
                    style={{
                      backgroundColor: action.color + '20',
                      color: action.color,
                    }}
                  >
                    {action.icon}
                  </div>
                  <div className='accion-contenido'>
                    <h4>{action.title}</h4>
                    <p>{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </LayoutGuardia>
  );
}

export default HomeGuardia;