"use strict";
import { useState, useEffect, useCallback } from "react";
import LayoutAdmin from "../../components/admin/LayoutAdmin";
import { useNavigate } from "react-router-dom";
import { getAuthToken, getUserData, isAdminOrGuard } from '../../helpers/authHelper';

// Importa las imágenes
import iconoCentral from '../../assets/BicicleteroCentral.png';
import iconoNorte from '../../assets/BicicleteroNorte.png';
import iconoSur from '../../assets/BicicleteroSur.png';
import iconoEste from '../../assets/BicicleteroEste.png';

function BicicletasAdmin() {
    const navigate = useNavigate();
    
    // URL base
    const API_URL = import.meta.env.VITE_API_URL;
    
    // Estados
    const [loading, setLoading] = useState(true);
    const [bicicleteros, setBicicleteros] = useState([]);
    const [bicicleteroSeleccionado, setBicicleteroSeleccionado] = useState(null);
    const [accionesBicicletero, setAccionesBicicletero] = useState([]);
    const [cargandoAcciones, setCargandoAcciones] = useState(false);
    
    // Tipos de acciones
    const tiposAccion = {
        'bicycle_register': { nombre: 'Ingreso Bicicleta', color: '#10B981', icono: '⬇️' },
        'bicycle_remove': { nombre: 'Salida Bicicleta', color: '#EF4444', icono: '⬆️' },
        'user_checkin': { nombre: 'Ingreso Usuario', color: '#3B82F6', icono: '👤' },
        'user_checkout': { nombre: 'Salida Usuario', color: '#8B5CF6', icono: '👋' },
        'reservation_create': { nombre: 'Reserva Realizada', color: '#3B82F6', icono: '📅' },
        'reservation_cancel': { nombre: 'Reserva Cancelada', color: '#F59E0B', icono: '❌' },
        'guard_assignment': { nombre: 'Guardia Asignado', color: '#8B5CF6', icono: '🛡️' },
        'guard_checkin': { nombre: 'Ingreso Guardia', color: '#6366F1', icono: '👮' },
        'guard_checkout': { nombre: 'Salida Guardia', color: '#A855F7', icono: '👮‍♂️' },
        'maintenance': { nombre: 'Mantenimiento', color: '#6B7280', icono: '🔧' },
        'time_violation': { nombre: 'Infracción Tiempo', color: '#DC2626', icono: '⏰' },
        'space_violation': { nombre: 'Infracción Espacio', color: '#B91C1C', icono: '🚫' },
        'system_notification': { nombre: 'Notificación Sistema', color: '#6B7280', icono: '🔔' },
        'admin_action': { nombre: 'Acción Admin', color: '#059669', icono: '⚙️' }
    };

    // Asignar iconos
    const asignarIcono = (nombre) => {
        const nombreLower = nombre.toLowerCase();
        if (nombreLower.includes('norte')) return iconoNorte;
        if (nombreLower.includes('sur')) return iconoSur;
        if (nombreLower.includes('este')) return iconoEste;
        return iconoCentral;
    };

    // Verificar autenticación
    const verificarAutenticacion = () => {
        const token = getAuthToken();
        const user = getUserData();
        
        if (!token || !user) {
            navigate('/auth/login');
            return false;
        }
        
        if (!isAdminOrGuard()) {
            alert('Acceso restringido');
            navigate('/');
            return false;
        }
        
        return true;
    };

    // Función para obtener bicicleteros
    const fetchBicicleteros = useCallback(async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            
            const response = await fetch(`${API_URL}/bikeracks`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }
            
            const result = await response.json();
            const bicicleterosData = result.data || result || [];
            
            // Transformar datos
            const bicicleterosTransformados = bicicleterosData.map(bicicletero => {
                const capacidad = bicicletero.capacity || 10;
                const ocupados = bicicletero.occupied || 0;
                const libres = bicicletero.free || (capacidad - ocupados);
                const porcentaje = capacidad > 0 ? Math.round((ocupados / capacidad) * 100) : 0;
                
                let estado = 'Activo';
                if (porcentaje >= 100) estado = 'Lleno';
                else if (porcentaje >= 80) estado = 'Casi Lleno';
                else if (ocupados === 0) estado = 'Vacío';
                
                // Colores según nombre
                let colorContenedor = '#3c84f6';
                let colorSombra = '#1d51a5ff';
                const nombreLower = bicicletero.name?.toLowerCase() || '';
                
                if (nombreLower.includes('sur')) {
                    colorContenedor = '#32bb94';
                    colorSombra = '#208367ff';
                } else if (nombreLower.includes('este')) {
                    colorContenedor = '#ffde69';
                    colorSombra = '#b19b4dff';
                } else if (nombreLower.includes('central')) {
                    colorContenedor = '#fd7452';
                    colorSombra = '#b85138ff';
                }
                
                return {
                    id: bicicletero._id || bicicletero.id || 0,
                    name: bicicletero.name || 'Bicicletero',
                    icono: asignarIcono(bicicletero.name),
                    capacidad: capacidad,
                    occupied: ocupados,
                    free: libres,
                    occupationPercentage: porcentaje,
                    status: estado,
                    ubicacion: bicicletero.location || 'Ubicación no especificada',
                    colorContenedor: colorContenedor,
                    colorSombra: colorSombra
                };
            });
            
            setBicicleteros(bicicleterosTransformados.length > 0 ? bicicleterosTransformados : getDatosEjemplo());
            
        } catch (error) {
            console.error("Error cargando bicicleteros:", error);
            setBicicleteros(getDatosEjemplo());
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    // Función para obtener historial
    const fetchHistorial = useCallback(async (bicicleteroId) => {
        if (!bicicleteroId) return;
        
        try {
            setCargandoAcciones(true);
            setAccionesBicicletero([]);
            
            const token = getAuthToken();
            const response = await fetch(`${API_URL}/history/bikerack/${bicicleteroId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error(`Error ${response.status}`);
            
            const result = await response.json();
            
            // Extraer array de acciones
            const accionesData = result.data?.data || result.data || [];
            
            // Transformar datos
            const accionesTransformadas = Array.isArray(accionesData) ? accionesData.map(accion => ({
                id: accion._id || accion.id || Math.random(),
                tipo: accion.type || accion.historyType || 'unknown',
                usuario: obtenerUsuarioDeAccion(accion),
                rut: accion.user?.rut || null,
                guardia: accion.guard?.name || null,
                fecha: accion.created_at || accion.createdAt || new Date().toISOString(),
                descripcion: accion.description || generarDescripcion(accion),
                bicicleta: accion.bicycle?.code || null
            })) : [];
            
            setAccionesBicicletero(accionesTransformadas);
            
        } catch (error) {
            console.error("Error cargando historial:", error);
            setAccionesBicicletero([]);
        } finally {
            setCargandoAcciones(false);
        }
    }, [API_URL]);

    // Funciones auxiliares
    const obtenerUsuarioDeAccion = (accion) => {
        if (accion.user?.name) return accion.user.name;
        if (accion.description?.includes('Usuario')) {
            const match = accion.description.match(/Usuario\s+(\w+)/);
            if (match) return match[1];
        }
        return 'Usuario';
    };

    const generarDescripcion = (accion) => {
        if (accion.description) return accion.description;
        return `Acción ${accion.type || 'desconocida'}`;
    };


    // Manejar selección
    const handleSeleccionarBicicletero = (bicicletero) => {
        setBicicleteroSeleccionado(bicicletero);
        fetchHistorial(bicicletero.id);
    };

    // Refrescar historial
    const handleRefrescarAcciones = () => {
        if (bicicleteroSeleccionado) {
            fetchHistorial(bicicleteroSeleccionado.id);
        }
    };

    // Recargar todo
    const handleRecargarTodo = () => {
        fetchBicicleteros();
    };

    // Determinar color de estado
    const getEstadoColor = (estado) => {
        const est = estado?.toLowerCase();
        switch(est) {
            case 'lleno': return '#DC2626';
            case 'casi lleno': return '#F59E0B';
            case 'activo': return '#10B981';
            case 'vacío': 
            case 'vacio': return '#6B7280';
            default: return '#9CA3AF';
        }
    };

    // Componente de carga
    const LoadingSpinner = () => (
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
            <div style={{ fontSize: '1.2rem', color: '#6B7280' }}>
                Cargando bicicleteros...
            </div>
        </div>
    );

    // Inicializar
    useEffect(() => {
        if (verificarAutenticacion()) {
            fetchBicicleteros();
        }
    }, [fetchBicicleteros]);

    // Auto-seleccionar primer bicicletero
    useEffect(() => {
        if (bicicleteros.length > 0 && !bicicleteroSeleccionado) {
            const primerBicicletero = bicicleteros[0];
            setBicicleteroSeleccionado(primerBicicletero);
            fetchHistorial(primerBicicletero.id);
        }
    }, [bicicleteros, bicicleteroSeleccionado, fetchHistorial]);

    if (loading && !bicicleteroSeleccionado) {
        return (
            <LayoutAdmin>
                <LoadingSpinner />
            </LayoutAdmin>
        );
    }

    return (
        <LayoutAdmin>
            <div style={{ padding: '20px' }}>
                
                {/* Encabezado */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px',
                    flexWrap: 'wrap',
                    gap: '15px'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '1.8rem',
                            fontWeight: 'bold',
                            color: '#ffffffff',
                            margin: 0
                        }}>
                            Gestión de Bicicleteros
                        </h1>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={handleRefrescarAcciones}
                            disabled={cargandoAcciones || !bicicleteroSeleccionado}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: (cargandoAcciones || !bicicleteroSeleccionado) ? '#9CA3AF' : '#10B981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: (cargandoAcciones || !bicicleteroSeleccionado) ? 'not-allowed' : 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            {cargandoAcciones ? '↻ Actualizando...' : '↻ Refrescar Tabla'}
                        </button>
                        
                        <button 
                            onClick={handleRecargarTodo}
                            disabled={loading}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: loading ? '#9CA3AF' : '#3B82F6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            {loading ? '↻ Cargando...' : '↻ Actualizar Todo'}
                        </button>
                    </div>
                </div>

                {/* CONTENIDO PRINCIPAL */}
                <div>
                    {/* Selección de bicicleteros */}
                    {bicicleteros.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px',
                            backgroundColor: '#F9FAFB',
                            borderRadius: '12px',
                            marginBottom: '30px'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🚲</div>
                            <h3 style={{ margin: '0 0 10px 0', color: '#4B5563' }}>
                                No hay bicicleteros registrados
                            </h3>
                        </div>
                    ) : (
                        <>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '30px',
                                marginBottom: '30px',
                                flexWrap: 'wrap'
                            }}>
                                {bicicleteros.map((bicicletero) => {
                                    const isActive = bicicleteroSeleccionado?.id === bicicletero.id;
                                    
                                    return (
                                        <div 
                                            key={bicicletero.id}
                                            style={{
                                                cursor: 'pointer',
                                                transition: 'all 0.3s',
                                                transform: isActive ? 'scale(1.05)' : 'scale(1)'
                                            }}
                                            onClick={() => handleSeleccionarBicicletero(bicicletero)}
                                            title={`Click para ver historial del bicicletero ${bicicletero.name}`}
                                        >
                                            <div style={{
                                                position: 'relative',
                                                marginBottom: '10px'
                                            }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '5px',
                                                    left: '5px',
                                                    right: 0,
                                                    bottom: 0,
                                                    backgroundColor: bicicletero.colorSombra,
                                                    borderRadius: '12px',
                                                    opacity: 0.5
                                                }}></div>
                                                
                                                <div style={{
                                                    position: 'relative',
                                                    backgroundColor: bicicletero.colorContenedor,
                                                    borderRadius: '12px',
                                                    padding: '25px',
                                                    color: 'white',
                                                    border: isActive ? '3px solid #ffffffff' : '3px solid white',
                                                    width: '240px',
                                                    height: '240px',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}>
                                                    <img 
                                                        src={bicicletero.icono} 
                                                        alt={bicicletero.name}
                                                        style={{
                                                            width: '200px',
                                                            height: '200px',
                                                            objectFit: 'contain'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '8px'
                                            }}>
                                                <div style={{
                                                    fontWeight: '600',
                                                    color: '#1F2937',
                                                    fontSize: '0.9rem',
                                                    marginBottom: '4px'
                                                }}>
                                                    {bicicletero.name}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.8rem',
                                                    color: '#6B7280'
                                                }}>
                                                    {bicicletero.occupied}/{bicicletero.capacidad} ocupados
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* TABLA DE ACCIONES DEL BICICLETERO SELECCIONADO */}
                            {bicicleteroSeleccionado && (
                                <div style={{
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    padding: '25px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '25px',
                                        paddingBottom: '15px',
                                        borderBottom: '1px solid #E5E7EB',
                                        flexWrap: 'wrap',
                                        gap: '20px'
                                    }}>
                                        <div>
                                            <h2 style={{
                                                fontSize: '1.4rem',
                                                fontWeight: 'bold',
                                                color: '#1F2937',
                                                margin: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}>
                                                <span style={{ 
                                                    backgroundColor: bicicleteroSeleccionado.colorContenedor,
                                                    color: 'white',
                                                    padding: '8px 12px',
                                                    borderRadius: '8px'
                                                }}>
                                                    📋
                                                </span>
                                                Historial - {bicicleteroSeleccionado.name}
                                            </h2>
                                            <div style={{
                                                display: 'flex',
                                                gap: '10px',
                                                marginTop: '8px',
                                                flexWrap: 'wrap'
                                            }}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    backgroundColor: '#F3F4F6',
                                                    borderRadius: '6px',
                                                    fontSize: '0.85rem',
                                                    color: '#6B7280'
                                                }}>
                                                    ID: {bicicleteroSeleccionado.id}
                                                </span>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    backgroundColor: getEstadoColor(bicicleteroSeleccionado.status) + '15',
                                                    borderRadius: '6px',
                                                    fontSize: '0.85rem',
                                                    color: getEstadoColor(bicicleteroSeleccionado.status),
                                                    fontWeight: '600'
                                                }}>
                                                    {bicicleteroSeleccionado.status}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div style={{
                                            display: 'flex',
                                            gap: '20px',
                                            textAlign: 'center'
                                        }}>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '4px' }}>Capacidad</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1F2937' }}>
                                                    {bicicleteroSeleccionado.capacidad}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '4px' }}>Ocupados</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#DC2626' }}>
                                                    {bicicleteroSeleccionado.occupied}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '4px' }}>Libres</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10B981' }}>
                                                    {bicicleteroSeleccionado.free}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Tabla de acciones */}
                                    <div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '15px',
                                            flexWrap: 'wrap',
                                            gap: '10px'
                                        }}>
                                            <h3 style={{
                                                fontSize: '1.1rem',
                                                fontWeight: '600',
                                                color: '#374151',
                                                margin: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                📋 Registro de Actividades
                                                <span style={{
                                                    padding: '2px 8px',
                                                    backgroundColor: '#F3F4F6',
                                                    borderRadius: '12px',
                                                    fontSize: '0.8rem',
                                                    color: '#6B7280'
                                                }}>
                                                    {cargandoAcciones ? 'Cargando...' : `${accionesBicicletero.length} registros`}
                                                </span>
                                            </h3>
                                        </div>
                                        
                                        {cargandoAcciones ? (
                                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                                <div style={{ 
                                                    width: '30px', 
                                                    height: '30px', 
                                                    border: '3px solid #f3f3f3',
                                                    borderTop: '3px solid #3B82F6',
                                                    borderRadius: '50%',
                                                    margin: '0 auto 15px',
                                                    animation: 'spin 1s linear infinite'
                                                }}></div>
                                                <p style={{ color: '#6B7280' }}>Cargando historial...</p>
                                            </div>
                                        ) : accionesBicicletero.length > 0 ? (
                                            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                                    <thead>
                                                        <tr style={{ backgroundColor: '#F9FAFB' }}>
                                                            <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#4B5563', borderBottom: '2px solid #E5E7EB' }}>Tipo</th>
                                                            <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#4B5563', borderBottom: '2px solid #E5E7EB' }}>Usuario/Guardia</th>
                                                            <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#4B5563', borderBottom: '2px solid #E5E7EB' }}>Detalles</th>
                                                            <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#4B5563', borderBottom: '2px solid #E5E7EB' }}>Fecha/Hora</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {accionesBicicletero.map((accion, index) => {
                                                            const tipoInfo = tiposAccion[accion.tipo] || { 
                                                                nombre: accion.tipo, 
                                                                color: '#6B7280', 
                                                                icono: '📝' 
                                                            };
                                                            
                                                            return (
                                                                <tr key={accion.id || index} style={{
                                                                    borderBottom: '1px solid #E5E7EB',
                                                                    backgroundColor: index % 2 === 0 ? 'white' : '#F9FAFB'
                                                                }}>
                                                                    <td style={{ padding: '12px 15px', verticalAlign: 'top' }}>
                                                                        <div style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '8px'
                                                                        }}>
                                                                            <span style={{ fontSize: '1.2rem' }}>
                                                                                {tipoInfo.icono}
                                                                            </span>
                                                                            <span style={{
                                                                                display: 'inline-block',
                                                                                padding: '4px 10px',
                                                                                backgroundColor: tipoInfo.color + '20',
                                                                                color: tipoInfo.color,
                                                                                borderRadius: '12px',
                                                                                fontSize: '0.8rem',
                                                                                fontWeight: '600'
                                                                            }}>
                                                                                {tipoInfo.nombre}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td style={{ padding: '12px 15px', verticalAlign: 'top' }}>
                                                                        {accion.usuario ? (
                                                                            <div>
                                                                                <div style={{ fontWeight: '500', color: '#1F2937' }}>
                                                                                    👤 {accion.usuario}
                                                                                </div>
                                                                                {accion.rut && (
                                                                                    <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                                                                                        RUT: {accion.rut}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ) : accion.guardia ? (
                                                                            <div>
                                                                                <div style={{ fontWeight: '500', color: '#1F2937' }}>
                                                                                    🛡️ {accion.guardia}
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <span style={{ color: '#9CA3AF' }}>No aplica</span>
                                                                        )}
                                                                    </td>
                                                                    <td style={{ padding: '12px 15px', verticalAlign: 'top' }}>
                                                                        <div style={{ marginBottom: '4px', color: '#1F2937' }}>
                                                                            {accion.descripcion}
                                                                        </div>
                                                                        {accion.bicicleta && (
                                                                            <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                                                                                <strong>Bicicleta:</strong> {accion.bicicleta}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td style={{ padding: '12px 15px', verticalAlign: 'top' }}>
                                                                        {accion.fecha ? (
                                                                            <>
                                                                                <div style={{ fontSize: '0.9rem', color: '#1F2937' }}>
                                                                                    {new Date(accion.fecha).toLocaleDateString('es-CL')}
                                                                                </div>
                                                                                <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                                                                                    {new Date(accion.fecha).toLocaleTimeString('es-CL', { 
                                                                                        hour: '2-digit', 
                                                                                        minute: '2-digit' 
                                                                                    })}
                                                                                </div>
                                                                            </>
                                                                        ) : (
                                                                            <span style={{ color: '#9CA3AF' }}>Sin fecha</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '60px 40px',
                                                backgroundColor: '#F9FAFB',
                                                borderRadius: '8px',
                                                color: '#6B7280'
                                            }}>
                                                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📭</div>
                                                <h4 style={{ margin: '0 0 10px 0', color: '#4B5563' }}>
                                                    No hay registros de actividades
                                                </h4>
                                                <p>No se han realizado acciones en este bicicletero aún.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Estilos CSS */}
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

export default BicicletasAdmin;