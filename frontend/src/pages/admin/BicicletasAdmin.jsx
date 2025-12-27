"use strict";
import { useState, useEffect } from "react";
import LayoutAdmin from "../../components/admin/LayoutAdmin";
import { apiService } from "../../services/api.service.js"; 
import { useNavigate } from "react-router-dom";

function BicicletasAdmin() {
    const navigate = useNavigate();
    
    // Estados para los datos
    const [bicicleteros, setBicicleteros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bicicleteroSeleccionado, setBicicleteroSeleccionado] = useState(null);

    // Colores para cada ubicación
    const coloresPorNombre = {
        'NORTE': { colorContenedor: '#3B82F6', colorSombra: '#1D4ED8' },
        'SUR': { colorContenedor: '#10B981', colorSombra: '#047857' },
        'ESTE': { colorContenedor: '#fade77', colorSombra: '#c7b162' },
        'OESTE': { colorContenedor: '#EF4444', colorSombra: '#DC2626' }
    };

    // Obtener datos del backend
    useEffect(() => {
  // DEBUG: Verificar token antes de hacer la petición
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  console.log('🔍 [FRONTEND] Token en localStorage:', token ? 'PRESENTE' : 'AUSENTE');
  console.log('🔍 [FRONTEND] User en localStorage:', user);
  
  if (!token) {
    console.log('❌ [FRONTEND] No hay token, redirigiendo a login');
    navigate('/auth/login');
    return;
  }
  
  // Decodificar token para ver contenido
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('📋 [FRONTEND] Payload del token:', {
        sub: payload.sub,
        id: payload.id,
        role: payload.role,
        email: payload.email,
        exp: payload.exp,
        expDate: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'No exp'
      });
      
      // Verificar rol
      if (payload.role !== 'admin') {
        console.log('⚠️ [FRONTEND] Usuario no es admin, es:', payload.role);
        // Redirigir según rol
        if (payload.role === 'guardia') {
          navigate('/home/guardia');
        } else {
          navigate('/home/user');
        }
        return;
      }
    }
  } catch (e) {
    console.error('❌ [FRONTEND] Error decodificando token:', e);
    localStorage.clear();
    navigate('/auth/login');
    return;
  }
  
  fetchBicicleteros();
}, [navigate]);

    const fetchBicicleteros = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Obtener token del localStorage
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            }
            
            console.log('📡 Solicitando bicicleteros...');
            
            // Usar api.service.js
            const response = await apiService.getBikeracks(token);
            console.log('📦 Respuesta del backend:', response);
            
            if (!response.success) {
                throw new Error(response.message || 'Error del servidor');
            }
            
            if (!Array.isArray(response.data)) {
                throw new Error('Formato de datos inválido del servidor');
            }
            
            // Procesar datos del backend
            const bicicleterosProcesados = response.data.map(bicicletero => {
                // Usar usedCapacity si está disponible, sino 0
                const ocupacion = bicicletero.usedCapacity || 0;
                
                // Calcular estado
                let estado = 'Activo';
                if (ocupacion >= bicicletero.capacity) {
                    estado = 'Lleno';
                } else if (ocupacion === 0) {
                    estado = 'Vacío';
                } else if (ocupacion / bicicletero.capacity > 0.8) {
                    estado = 'Casi Lleno';
                }
                
                // Obtener colores basados en el nombre
                const nombreUpper = bicicletero.name?.toUpperCase() || '';
                const colores = coloresPorNombre[nombreUpper] || {
                    colorContenedor: '#6B7280',
                    colorSombra: '#4B5563'
                };
                
                return {
                    id: bicicletero.id,
                    nombre: bicicletero.name || `Bicicletero ${bicicletero.id}`,
                    capacidad: bicicletero.capacity || 40,
                    ocupacion: ocupacion,
                    espaciosDisponibles: (bicicletero.capacity || 40) - ocupacion,
                    porcentajeOcupacion: Math.round((ocupacion / (bicicletero.capacity || 40)) * 100),
                    estado: estado,
                    colorContenedor: colores.colorContenedor,
                    colorSombra: colores.colorSombra
                };
            });
            
            console.log('✅ Bicicleteros procesados:', bicicleterosProcesados);
            setBicicleteros(bicicleterosProcesados);
            
            // Seleccionar el primero por defecto
            if (bicicleterosProcesados.length > 0) {
                setBicicleteroSeleccionado(bicicleterosProcesados[0]);
            }
            
        } catch (err) {
            console.error('💥 Error al cargar bicicleteros:', err);
            setError(err.message || 'Error al cargar los bicicleteros');
            
            // Si es error de autenticación, redirigir a login
            if (err.message?.includes('Sesión expirada') || err.message?.includes('401')) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                navigate('/auth/login');
            }
        } finally {
            setLoading(false);
        }
    };

    // Manejar selección de bicicletero
    const handleSeleccionarBicicletero = (bicicletero) => {
        setBicicleteroSeleccionado(bicicletero);
    };

    // Manejar recarga de datos
    const handleRecargar = () => {
        fetchBicicleteros();
    };

    // Manejar edición
    const handleEditar = () => {
        if (!bicicleteroSeleccionado) return;
        
        // Aquí puedes abrir un modal o redirigir a una página de edición
        alert(`Funcionalidad de edición para: ${bicicleteroSeleccionado.nombre}\n\nEsta funcionalidad está en desarrollo.`);
        
        // Ejemplo de cómo sería:
        // navigate(`/home/admin/bicicletas/editar/${bicicleteroSeleccionado.id}`);
    };

    // Renderizar estados de carga
    if (loading) {
        return (
            <LayoutAdmin>
                <div style={{ 
                    padding: '60px 20px', 
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px'
                }}>
                    <div style={{ 
                        width: '50px', 
                        height: '50px', 
                        border: '5px solid #f3f3f3',
                        borderTop: '5px solid #3B82F6',
                        borderRadius: '50%',
                        marginBottom: '20px',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <div style={{ 
                        fontSize: '1.2rem', 
                        color: '#6B7280',
                        marginBottom: '10px'
                    }}>
                        Cargando bicicleteros...
                    </div>
                    <div style={{ 
                        fontSize: '0.9rem', 
                        color: '#9CA3AF'
                    }}>
                        Obteniendo información del servidor
                    </div>
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            </LayoutAdmin>
        );
    }

    if (error) {
        return (
            <LayoutAdmin>
                <div style={{ 
                    padding: '60px 20px', 
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px'
                }}>
                    <div style={{ 
                        fontSize: '3rem',
                        color: '#EF4444',
                        marginBottom: '20px'
                    }}>
                        ⚠️
                    </div>
                    <div style={{ 
                        fontSize: '1.3rem', 
                        color: '#EF4444',
                        marginBottom: '15px',
                        fontWeight: '500'
                    }}>
                        Error al cargar los bicicleteros
                    </div>
                    <div style={{ 
                        fontSize: '1rem', 
                        color: '#6B7280',
                        marginBottom: '30px',
                        maxWidth: '400px',
                        lineHeight: '1.5'
                    }}>
                        {error}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={handleRecargar}
                            style={{
                                padding: '10px 24px',
                                backgroundColor: '#3B82F6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#2563EB'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#3B82F6'}
                        >
                            Reintentar
                        </button>
                        <button 
                            onClick={() => navigate('/home/admin')}
                            style={{
                                padding: '10px 24px',
                                backgroundColor: '#F3F4F6',
                                color: '#4B5563',
                                border: '1px solid #D1D5DB',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#E5E7EB'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                        >
                            Volver al Dashboard
                        </button>
                    </div>
                </div>
            </LayoutAdmin>
        );
    }

    if (bicicleteros.length === 0) {
        return (
            <LayoutAdmin>
                <div style={{ 
                    padding: '60px 20px', 
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px'
                }}>
                    <div style={{ 
                        fontSize: '3rem',
                        color: '#9CA3AF',
                        marginBottom: '20px'
                    }}>
                        🚲
                    </div>
                    <div style={{ 
                        fontSize: '1.3rem', 
                        color: '#6B7280',
                        marginBottom: '15px',
                        fontWeight: '500'
                    }}>
                        No hay bicicleteros disponibles
                    </div>
                    <div style={{ 
                        fontSize: '1rem', 
                        color: '#9CA3AF',
                        marginBottom: '30px',
                        maxWidth: '400px',
                        lineHeight: '1.5'
                    }}>
                        No se encontraron bicicleteros en el sistema. Contacta al administrador.
                    </div>
                    <button 
                        onClick={handleRecargar}
                        style={{
                            padding: '10px 24px',
                            backgroundColor: '#10B981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '500'
                        }}
                    >
                        Actualizar
                    </button>
                </div>
            </LayoutAdmin>
        );
    }

    return (
        <LayoutAdmin>
            <div style={{ padding: '20px' }}>
                {/* Encabezado con título y botón de recargar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px',
                    flexWrap: 'wrap',
                    gap: '15px'
                }}>
                    <h1 style={{
                        fontSize: '1.8rem',
                        fontWeight: 'bold',
                        color: '#333',
                        margin: 0
                    }}>
                        BICICLETEROS
                    </h1>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={handleRecargar}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#F3F4F6',
                                color: '#4B5563',
                                border: '1px solid #D1D5DB',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <span>↻</span> Actualizar
                        </button>
                        <div style={{
                            padding: '8px 16px',
                            backgroundColor: '#F0F9FF',
                            color: '#0369A1',
                            border: '1px solid #BAE6FD',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                        }}>
                            Total: {bicicleteros.length} bicicleteros
                        </div>
                    </div>
                </div>
                
                {/* Contenedor en línea horizontal 4x1 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '30px',
                    marginBottom: '30px',
                    flexWrap: 'wrap'
                }}>
                    {bicicleteros.map((bicicletero) => {
                        const isActive = bicicleteroSeleccionado && 
                                        bicicleteroSeleccionado.id === bicicletero.id;
                        
                        return (
                            <div 
                                key={bicicletero.id}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s'
                                }}
                                onClick={() => handleSeleccionarBicicletero(bicicletero)}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {/* Contenedor principal */}
                                <div style={{
                                    position: 'relative',
                                    width: '160px',
                                    height: '160px',
                                    marginBottom: '15px'
                                }}>
                                    {/* Sombra sólida detrás */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '6px',
                                        left: '6px',
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: bicicletero.colorSombra,
                                        borderRadius: '15px'
                                    }}></div>
                                    
                                    {/* Contenedor de color */}
                                    <div style={{
                                        position: 'relative',
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: bicicletero.colorContenedor,
                                        borderRadius: '15px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        padding: '20px',
                                        border: isActive ? '3px solid white' : 'none',
                                        boxShadow: isActive ? '0 0 0 2px #333, 0 10px 20px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0,0,0,0.1)',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        {/* Ícono */}
                                        <div style={{
                                            fontSize: '2.5rem',
                                            fontWeight: 'bold',
                                            color: 'white',
                                            marginBottom: '8px'
                                        }}>
                                            🚲
                                        </div>
                                        
                                        {/* Porcentaje de ocupación */}
                                        <div style={{
                                            fontSize: '0.9rem',
                                            color: 'white',
                                            backgroundColor: 'rgba(0,0,0,0.2)',
                                            padding: '3px 10px',
                                            borderRadius: '10px',
                                            fontWeight: '600'
                                        }}>
                                            {bicicletero.porcentajeOcupacion}%
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Nombre y estadísticas */}
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        fontSize: '1.3rem',
                                        fontWeight: 'bold',
                                        color: isActive ? bicicletero.colorContenedor : '#333',
                                        textTransform: 'uppercase',
                                        marginBottom: '5px'
                                    }}>
                                        {bicicletero.nombre}
                                    </div>
                                    <div style={{
                                        fontSize: '0.9rem',
                                        color: '#6B7280',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '2px'
                                    }}>
                                        <div>{bicicletero.ocupacion}/{bicicletero.capacidad}</div>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: bicicletero.estado === 'Lleno' ? '#DC2626' : 
                                                   bicicletero.estado === 'Casi Lleno' ? '#F59E0B' : '#10B981'
                                        }}>
                                            {bicicletero.estado}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Mostrar tabla solo si hay un bicicletero seleccionado */}
                {bicicleteroSeleccionado && (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        overflow: 'hidden',
                        marginTop: '20px',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        {/* Encabezado de tabla */}
                        <div style={{
                            padding: '18px 24px',
                            backgroundColor: bicicleteroSeleccionado.colorContenedor,
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{
                                fontSize: '1.3rem',
                                fontWeight: 'bold',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <span style={{ 
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    padding: '5px 10px',
                                    borderRadius: '6px'
                                }}>
                                    🚲
                                </span>
                                <span>
                                    Bicicletero {bicicleteroSeleccionado.id} - {bicicleteroSeleccionado.nombre}
                                </span>
                            </h2>
                            <div style={{
                                fontSize: '0.9rem',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontWeight: '500'
                            }}>
                                ID: {bicicleteroSeleccionado.id}
                            </div>
                        </div>
                        
                        {/* Tabla */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse'
                            }}>
                                <thead>
                                    <tr style={{
                                        backgroundColor: '#f8f9fa'
                                    }}>
                                        <th style={{
                                            padding: '14px 16px',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            color: '#495057',
                                            borderBottom: '2px solid #dee2e6'
                                        }}>
                                            ID
                                        </th>
                                        <th style={{
                                            padding: '14px 16px',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            color: '#495057',
                                            borderBottom: '2px solid #dee2e6'
                                        }}>
                                            Ubicación
                                        </th>
                                        <th style={{
                                            padding: '14px 16px',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            color: '#495057',
                                            borderBottom: '2px solid #dee2e6'
                                        }}>
                                            Capacidad
                                        </th>
                                        <th style={{
                                            padding: '14px 16px',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            color: '#495057',
                                            borderBottom: '2px solid #dee2e6'
                                        }}>
                                            Ocupación
                                        </th>
                                        <th style={{
                                            padding: '14px 16px',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            color: '#495057',
                                            borderBottom: '2px solid #dee2e6'
                                        }}>
                                            Estado
                                        </th>
                                        <th style={{
                                            padding: '14px 16px',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            color: '#495057',
                                            borderBottom: '2px solid #dee2e6'
                                        }}>
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{
                                        backgroundColor: bicicleteroSeleccionado.id % 2 === 0 ? '#f9fafb' : 'white'
                                    }}>
                                        <td style={{ 
                                            padding: '14px 16px',
                                            verticalAlign: 'middle'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    backgroundColor: bicicleteroSeleccionado.colorContenedor,
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    marginRight: '12px',
                                                    fontWeight: 'bold',
                                                    color: 'white',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {bicicleteroSeleccionado.id}
                                                </div>
                                                <div style={{
                                                    fontWeight: '600',
                                                    color: '#212529'
                                                }}>
                                                    #{bicicleteroSeleccionado.id}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ 
                                            padding: '14px 16px', 
                                            color: '#495057',
                                            fontWeight: '500',
                                            verticalAlign: 'middle'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{
                                                    width: '12px',
                                                    height: '12px',
                                                    backgroundColor: bicicleteroSeleccionado.colorContenedor,
                                                    borderRadius: '50%'
                                                }}></div>
                                                {bicicleteroSeleccionado.nombre}
                                            </div>
                                        </td>
                                        <td style={{ 
                                            padding: '14px 16px', 
                                            color: '#495057',
                                            fontWeight: '600',
                                            verticalAlign: 'middle'
                                        }}>
                                            {bicicleteroSeleccionado.capacidad} espacios
                                        </td>
                                        <td style={{ 
                                            padding: '14px 16px', 
                                            color: '#495057',
                                            fontWeight: '600',
                                            verticalAlign: 'middle'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div>{bicicleteroSeleccionado.ocupacion} bicicletas</div>
                                                <div style={{
                                                    width: '100px',
                                                    height: '6px',
                                                    backgroundColor: '#E5E7EB',
                                                    borderRadius: '3px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        width: `${bicicleteroSeleccionado.porcentajeOcupacion}%`,
                                                        height: '100%',
                                                        backgroundColor: bicicleteroSeleccionado.colorContenedor,
                                                        transition: 'width 0.5s ease'
                                                    }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ 
                                            padding: '14px 16px',
                                            verticalAlign: 'middle'
                                        }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                backgroundColor: bicicleteroSeleccionado.estado === 'Activo' 
                                                    ? '#D1FAE5' 
                                                    : bicicleteroSeleccionado.estado === 'Lleno'
                                                    ? '#FEE2E2'
                                                    : bicicleteroSeleccionado.estado === 'Casi Lleno'
                                                    ? '#FEF3C7'
                                                    : '#E0E7FF',
                                                color: bicicleteroSeleccionado.estado === 'Activo' 
                                                    ? '#065F46' 
                                                    : bicicleteroSeleccionado.estado === 'Lleno'
                                                    ? '#991B1B'
                                                    : bicicleteroSeleccionado.estado === 'Casi Lleno'
                                                    ? '#92400E'
                                                    : '#3730A3',
                                                border: `1px solid ${
                                                    bicicleteroSeleccionado.estado === 'Activo' 
                                                    ? '#A7F3D0' 
                                                    : bicicleteroSeleccionado.estado === 'Lleno'
                                                    ? '#FECACA'
                                                    : bicicleteroSeleccionado.estado === 'Casi Lleno'
                                                    ? '#FDE68A'
                                                    : '#C7D2FE'
                                                }`
                                            }}>
                                                {bicicleteroSeleccionado.estado}
                                            </span>
                                        </td>
                                        <td style={{ 
                                            padding: '14px 16px',
                                            verticalAlign: 'middle'
                                        }}>
                                            <button 
                                                style={{
                                                    padding: '8px 18px',
                                                    backgroundColor: bicicleteroSeleccionado.colorContenedor,
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '500',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                                onClick={handleEditar}
                                                onMouseOver={(e) => {
                                                    e.target.style.backgroundColor = bicicleteroSeleccionado.colorSombra;
                                                    e.target.style.transform = 'translateY(-2px)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.target.style.backgroundColor = bicicleteroSeleccionado.colorContenedor;
                                                    e.target.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                <span>✏️</span> Editar
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pie de tabla con estadísticas */}
                        <div style={{
                            padding: '16px 24px',
                            backgroundColor: '#f8f9fa',
                            borderTop: '1px solid #dee2e6',
                            fontSize: '0.9rem',
                            color: '#6c757d',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '10px'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div>
                                    <strong>Ocupación:</strong> {bicicleteroSeleccionado.ocupacion}/{bicicleteroSeleccionado.capacidad} bicicletas ({bicicleteroSeleccionado.porcentajeOcupacion}%)
                                </div>
                                <div>
                                    <strong>Disponibilidad:</strong> {bicicleteroSeleccionado.espaciosDisponibles} espacios libres
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                <div>
                                    <strong>Última actualización:</strong> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
                                    Seleccionado de {bicicleteros.length} bicicleteros
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        </LayoutAdmin>
    );
}

export default BicicletasAdmin;