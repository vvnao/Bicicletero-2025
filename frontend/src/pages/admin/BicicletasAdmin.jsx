"use strict";
import { useState, useEffect } from "react";
import LayoutAdmin from "../../components/admin/LayoutAdmin";
import { useNavigate } from "react-router-dom";
import { getAuthToken, getUserData, isAdminOrGuard } from '../../helpers/authHelper';

// Importa las imágenes correctamente
import iconoCentral from '../../assets/BicicleteroCentral.png';
import iconoNorte from '../../assets/BicicleteroNorte.png';
import iconoSur from '../../assets/BicicleteroSur.png';
import iconoEste from '../../assets/BicicleteroEste.png';

function BicicletasAdmin() {
    const navigate = useNavigate();
    
    // Estados principales
    const [loading, setLoading] = useState(true);
    const [backendStatus, setBackendStatus] = useState({
        connected: false,
        message: "Conectando...",
        error: null
    });
    
    // Estados para bicicleteros
    const [bicicleteros, setBicicleteros] = useState([]);
    const [bicicleteroSeleccionado, setBicicleteroSeleccionado] = useState(null);
    
    // Estados para las acciones del bicicletero seleccionado
    const [accionesBicicletero, setAccionesBicicletero] = useState([]);
    const [cargandoAcciones, setCargandoAcciones] = useState(false);
    
    // Tipos de acciones con colores (actualizado)
    const tiposAccion = {
        'ingreso': { nombre: 'Ingreso de Bicicleta', color: '#10B981', icono: '⬇️' },
        'salida': { nombre: 'Salida de Bicicleta', color: '#EF4444', icono: '⬆️' },
        'reserva': { nombre: 'Reserva Realizada', color: '#3B82F6', icono: '📅' },
        'cancelacion': { nombre: 'Reserva Cancelada', color: '#F59E0B', icono: '❌' },
        'asignacion': { nombre: 'Guardia Asignado', color: '#8B5CF6', icono: '🛡️' },
        'mantenimiento': { nombre: 'Mantenimiento', color: '#6B7280', icono: '🔧' },
        'infraccion': { nombre: 'Infracción por Tiempo', color: '#DC2626', icono: '⏰' }
    };

    // Datos de ejemplo de bicicleteros
    const datosEjemploBicicleteros = [
        {
            id: 1,
            name: 'BICICLETERO NORTE',
            icono: iconoNorte,
            capacidad: 12,
            occupied: 12,
            free: 0,
            occupationPercentage: 100,
            status: 'Lleno',
            ubicacion: 'Entrada sur, frente a biblioteca',
            colorContenedor: '#3c84f6',
            colorSombra: '#1d51a5ff'
        },
        {
            id: 2,
            name: 'BICICLETERO SUR',
            icono: iconoSur,
            capacidad: 8,
            occupied: 5,
            free: 3,
            occupationPercentage: 63,
            status: 'Activo',
            ubicacion: 'Estacionamiento central',
            colorContenedor: '#32bb94',
            colorSombra: '#208367ff'
        },
        {
            id: 3,
            name: 'BICICLETERO ESTE',
            icono: iconoEste,
            capacidad: 20,
            occupied: 15,
            free: 5,
            occupationPercentage: 75,
            status: 'Activo',
            ubicacion: 'Ubicación por definir',
            colorContenedor: '#ffde69',
            colorSombra: '#b19b4dff'
        },
        {
            id: 4,
            name: 'BICICLETERO CENTRAL',
            icono: iconoCentral,
            capacidad: 10,
            occupied: 8,
            free: 2,
            occupationPercentage: 80,
            status: 'Activo',
            ubicacion: 'Entrada principal norte del campus',
            colorContenedor: '#fd7452',
            colorSombra: '#b85138ff'
        },
    ];
    
    // Datos de ejemplo de acciones para cada bicicletero
    const accionesEjemplo = {
        1: [ // ENTRADA NORTE
            { id: 1, tipo: 'ingreso', usuario: 'Juan Pérez', rut: '12.345.678-9', bicicleta: 'BIC-001', fecha: new Date().toISOString(), guardia: 'Carlos López' },
            { id: 2, tipo: 'reserva', usuario: 'María González', rut: '98.765.432-1', fecha: new Date(Date.now() - 3600000).toISOString(), horas: 3 },
            { id: 3, tipo: 'salida', usuario: 'Pedro Sánchez', rut: '11.222.333-4', bicicleta: 'BIC-003', fecha: new Date(Date.now() - 7200000).toISOString(), guardia: 'Ana Martínez' },
            { id: 4, tipo: 'asignacion', guardia: 'Roberto Díaz', fecha: new Date(Date.now() - 86400000).toISOString(), turno: 'Mañana' }
        ],
        2: [ // ENTRADA SUR
            { id: 5, tipo: 'ingreso', usuario: 'Laura Fernández', rut: '55.666.777-8', bicicleta: 'BIC-004', fecha: new Date().toISOString(), guardia: 'Carlos López' },
            { id: 6, tipo: 'ingreso', usuario: 'Diego Ramírez', rut: '99.888.777-6', bicicleta: 'BIC-005', fecha: new Date(Date.now() - 1800000).toISOString(), guardia: 'Ana Martínez' },
            { id: 7, tipo: 'mantenimiento', descripcion: 'Reparación cerradura', fecha: new Date(Date.now() - 172800000).toISOString(), tecnico: 'Soporte Técnico' }
        ],
        3: [ // ESTACIONAMIENTO
            { id: 8, tipo: 'reserva', usuario: 'Andrea López', rut: '33.444.555-6', fecha: new Date().toISOString(), horas: 2 },
            { id: 9, tipo: 'cancelacion', usuario: 'Miguel Torres', rut: '22.333.444-5', fecha: new Date(Date.now() - 5400000).toISOString(), motivo: 'Cambio de planes' },
            { id: 10, tipo: 'salida', usuario: 'Juan Pérez', rut: '12.345.678-9', bicicleta: 'BIC-001', fecha: new Date(Date.now() - 10800000).toISOString(), guardia: 'Roberto Díaz' }
        ],
        4: [ // NO SE
            { id: 11, tipo: 'asignacion', guardia: 'Patricia Gómez', fecha: new Date().toISOString(), turno: 'Tarde' },
            { id: 12, tipo: 'ingreso', usuario: 'Fernando Castro', rut: '77.888.999-0', bicicleta: 'BIC-006', fecha: new Date(Date.now() - 900000).toISOString(), guardia: 'Patricia Gómez' }
        ]
    };

    // Función para importar servicio dinámicamente
    const getBikerackService = async () => {
        try {
            const module = await import("../../services/bikerack.service");
            return module.default;
        } catch (error) {
            console.error("❌ No se pudo cargar el servicio:", error);
            return null;
        }
    };

    // Verificar conexión y autenticación
    const verificarConexion = async () => {
        try {
            const token = getAuthToken();
            const user = getUserData();
            
            if (!token || !user) {
                navigate('/auth/login');
                return false;
            }
            
            if (!isAdminOrGuard()) {
                alert('Acceso restringido a administradores y guardias');
                navigate('/');
                return false;
            }
            
            const service = await getBikerackService();
            if (!service) {
                throw new Error("Servicio no disponible");
            }
            
            // Probar conexión
            try {
                await service.getAll();
                setBackendStatus({
                    connected: true,
                    message: "✅ Conectado al servidor",
                    error: null
                });
            } catch (apiError) {
                setBackendStatus({
                    connected: false,
                    message: "⚠️ Modo demostración",
                    error: apiError.message
                });
            }
            
            return true;
        } catch (error) {
            setBackendStatus({
                connected: false,
                message: "⚠️ Modo demostración",
                error: error.message
            });
            return false;
        }
    };

    // Función para cargar bicicleteros - CONEXIÓN REAL AL BACKEND
    const cargarBicicleteros = async () => {
        try {
            setLoading(true);
            
            const service = await getBikerackService();
            
            if (service && backendStatus.connected) {
                // Cargar bicicleteros reales del backend
                const bicicleterosReales = await service.getAll();
                
                // Asignar iconos según el nombre del bicicletero
                const bicicleterosConIconos = bicicleterosReales.map(bicicletero => {
                    let icono = iconoCentral; // por defecto
                    
                    if (bicicletero.name.toLowerCase().includes('norte')) icono = iconoNorte;
                    else if (bicicletero.name.toLowerCase().includes('sur')) icono = iconoSur;
                    else if (bicicletero.name.toLowerCase().includes('este')) icono = iconoEste;
                    
                    return {
                        ...bicicletero,
                        icono: icono
                    };
                });
                
                setBicicleteros(bicicleterosConIconos);
                
                // Seleccionar el primer bicicletero por defecto
                if (!bicicleteroSeleccionado && bicicleterosConIconos.length > 0) {
                    setBicicleteroSeleccionado(bicicleterosConIconos[0]);
                    cargarAccionesBicicletero(bicicleterosConIconos[0].id);
                }
                
            } else {
                // Usar datos de ejemplo si no hay conexión
                console.log('⚠️ Usando datos de ejemplo (modo demostración)');
                setBicicleteros(datosEjemploBicicleteros);
                
                if (!bicicleteroSeleccionado) {
                    setBicicleteroSeleccionado(datosEjemploBicicleteros[0]);
                    cargarAccionesBicicletero(datosEjemploBicicleteros[0].id);
                }
            }
            
        } catch (error) {
            console.error("❌ Error cargando bicicleteros:", error);
            
            // Fallback a datos de ejemplo
            setBicicleteros(datosEjemploBicicleteros);
            if (!bicicleteroSeleccionado) {
                setBicicleteroSeleccionado(datosEjemploBicicleteros[0]);
                cargarAccionesBicicletero(datosEjemploBicicleteros[0].id);
            }
            
        } finally {
            setLoading(false);
        }
    };

    // Función para cargar acciones del backend
    const cargarAccionesBicicletero = async (bicicleteroId) => {
        try {
            setCargandoAcciones(true);
            
            const service = await getBikerackService();
            
            if (service && backendStatus.connected) {
                // Intentar cargar acciones reales del backend
                const accionesReales = await service.getBikerackActions(bicicleteroId);
                setAccionesBicicletero(accionesReales);
            } else {
                // Fallback a datos de ejemplo
                console.log('⚠️ Usando acciones de ejemplo');
                const acciones = accionesEjemplo[bicicleteroId] || [];
                setAccionesBicicletero(acciones);
            }
            
        } catch (error) {
            console.error(`❌ Error cargando acciones del bicicletero ${bicicleteroId}:`, error);
            
            // Fallback a datos de ejemplo
            const acciones = accionesEjemplo[bicicleteroId] || [];
            setAccionesBicicletero(acciones);
            
        } finally {
            setCargandoAcciones(false);
        }
    };

    // Manejar selección de bicicletero
    const handleSeleccionarBicicletero = async (bicicletero) => {
        setBicicleteroSeleccionado(bicicletero);
        await cargarAccionesBicicletero(bicicletero.id);
    };

    // Recargar datos
    const handleRecargar = async () => {
        setLoading(true);
        await cargarBicicleteros();
    };

    // Determinar color de estado
    const getEstadoColor = (estado) => {
        const est = estado?.toLowerCase();
        switch(est) {
            case 'lleno': return '#DC2626';
            case 'casi lleno': return '#F59E0B';
            case 'activo': return '#10B981';
            case 'vacío': return '#6B7280';
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
            <div style={{ fontSize: '1.2rem', color: '#6B7280', marginBottom: '10px' }}>
                {backendStatus.message}
            </div>
        </div>
    );

    // Inicialización
    useEffect(() => {
        const inicializar = async () => {
            await verificarConexion();
            await cargarBicicleteros();
        };
        
        inicializar();
    }, []);

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
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginTop: '5px'
                        }}>
                            <span style={{
                                display: 'inline-block',
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: backendStatus.connected ? '#10B981' : '#F59E0B'
                            }}></span>
                            <span style={{
                                fontSize: '0.9rem',
                                color: backendStatus.connected ? '#10B981' : '#F59E0B',
                                fontWeight: '500'
                            }}>
                                {backendStatus.message}
                            </span>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={handleRecargar}
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
                                gap: '6px',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#2563EB')}
                            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#3B82F6')}
                        >
                            {loading ? 'Cargando...' : '↻ Actualizar'}
                        </button>
                      
                    </div>
                </div>

                {/* CONTENIDO PRINCIPAL */}
                <div>
                    {/* Selección de bicicleteros - SOLO IMÁGENES */}
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
                                        transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                        opacity: loading ? 0.7 : 1
                                    }}
                                    onClick={() => handleSeleccionarBicicletero(bicicletero)}
                                    title={`Click para ver acciones del bicicletero ${bicicletero.name}`}
                                >
                                    {/* Contenedor con sombra */}
                                    <div style={{
                                        position: 'relative',
                                        marginBottom: '10px'
                                    }}>
                                        {/* Sombra */}
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
                                        
                                        {/* Tarjeta principal con sombra sólida */}
                                        <div style={{
                                            position: 'relative',
                                            backgroundColor: bicicletero.colorContenedor,
                                            borderRadius: '12px',
                                            padding: '25px',
                                            color: 'white',
                                            border: '3px solid white',
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
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            animation: 'fadeIn 0.3s ease'
                        }}>
                            {/* Encabezado del bicicletero */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '25px',
                                paddingBottom: '15px',
                                borderBottom: '1px solid #E5E7EB'
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
                                        Acciones - {bicicleteroSeleccionado.name}
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
                                        <span style={{
                                            padding: '4px 10px',
                                            backgroundColor: '#F0F9FF',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            color: '#0369A1'
                                        }}>
                                            📍 {bicicleteroSeleccionado.ubicacion}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Estadísticas rápidas */}
                                <div style={{
                                    display: 'flex',
                                    gap: '15px',
                                    textAlign: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Capacidad</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1F2937' }}>
                                            {bicicleteroSeleccionado.capacidad}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Ocupados</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#DC2626' }}>
                                            {bicicleteroSeleccionado.occupied}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Libres</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10B981' }}>
                                            {bicicleteroSeleccionado.free}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Tabla de acciones */}
                            <div>
                                <h3 style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '15px',
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
                                        {accionesBicicletero.length} acciones
                                    </span>
                                </h3>
                                
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
                                        <p style={{ color: '#6B7280' }}>Cargando acciones del bicicletero...</p>
                                    </div>
                                ) : accionesBicicletero.length > 0 ? (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                                                    const tipoInfo = tiposAccion[accion.tipo] || { nombre: accion.tipo, color: '#6B7280', icono: '📝' };
                                                    
                                                    return (
                                                        <tr key={accion.id} style={{
                                                            borderBottom: '1px solid #E5E7EB',
                                                            backgroundColor: index % 2 === 0 ? 'white' : '#F9FAFB',
                                                            transition: 'background-color 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#F9FAFB'}>
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
                                                                {accion.tipo === 'asignacion' ? (
                                                                    <div>
                                                                        <div style={{ fontWeight: '500', color: '#1F2937', marginBottom: '4px' }}>
                                                                            🛡️ {accion.guardia || 'Guardia asignado'}
                                                                        </div>
                                                                        {accion.turno && (
                                                                            <div style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '2px' }}>
                                                                                Turno: {accion.turno}
                                                                            </div>
                                                                        )}
                                                                        {accion.horario && (
                                                                            <div style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '2px' }}>
                                                                                Horario: {accion.horario}
                                                                            </div>
                                                                        )}
                                                                        {accion.dia && (
                                                                            <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                                                                                Día: {accion.dia}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : accion.usuario ? (
                                                                    <div>
                                                                        <div style={{ fontWeight: '500', color: '#1F2937' }}>
                                                                            {accion.usuario}
                                                                        </div>
                                                                        {accion.rut && (
                                                                            <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '2px' }}>
                                                                                RUT: {accion.rut}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : accion.guardia ? (
                                                                    <div>
                                                                        <div style={{ fontWeight: '500', color: '#1F2937' }}>
                                                                            🛡️ {accion.guardia}
                                                                        </div>
                                                                        {accion.turno && (
                                                                            <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '2px' }}>
                                                                                Turno: {accion.turno}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span style={{ color: '#9CA3AF' }}>N/A</span>
                                                                )}
                                                            </td>
                                                            <td style={{ padding: '12px 15px', verticalAlign: 'top' }}>
                                                                {accion.tipo === 'asignacion' ? (
                                                                    <div>
                                                                        <div style={{ marginBottom: '4px' }}>
                                                                            <span style={{ fontWeight: '500', color: '#1F2937' }}>Tipo: </span>
                                                                            <span>Asignación de Guardia</span>
                                                                        </div>
                                                                        {accion.asignadoPor && (
                                                                            <div style={{ marginBottom: '4px' }}>
                                                                                <span style={{ fontWeight: '500', color: '#1F2937' }}>Asignado por: </span>
                                                                                <span>{accion.asignadoPor}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        {accion.bicicleta && (
                                                                            <div style={{ marginBottom: '4px' }}>
                                                                                <span style={{ fontWeight: '500', color: '#1F2937' }}>Bicicleta: </span>
                                                                                <span style={{ fontFamily: 'monospace' }}>{accion.bicicleta}</span>
                                                                            </div>
                                                                        )}
                                                                        {accion.horas && (
                                                                            <div style={{ marginBottom: '4px' }}>
                                                                                <span style={{ fontWeight: '500', color: '#1F2937' }}>Horas: </span>
                                                                                <span>{accion.horas} horas</span>
                                                                            </div>
                                                                        )}
                                                                        {accion.descripcion && (
                                                                            <div>
                                                                                <span style={{ fontWeight: '500', color: '#1F2937' }}>Descripción: </span>
                                                                                <span>{accion.descripcion}</span>
                                                                            </div>
                                                                        )}
                                                                        {accion.motivo && (
                                                                            <div>
                                                                                <span style={{ fontWeight: '500', color: '#1F2937' }}>Motivo: </span>
                                                                                <span>{accion.motivo}</span>
                                                                            </div>
                                                                        )}
                                                                        {accion.tecnico && (
                                                                            <div>
                                                                                <span style={{ fontWeight: '500', color: '#1F2937' }}>Técnico: </span>
                                                                                <span>{accion.tecnico}</span>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </td>
                                                            <td style={{ padding: '12px 15px', verticalAlign: 'top', fontSize: '0.9rem', color: '#6B7280' }}>
                                                                {accion.fecha ? new Date(accion.fecha).toLocaleString('es-CL', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                }) : 'N/A'}
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
                                        padding: '40px',
                                        backgroundColor: '#F9FAFB',
                                        borderRadius: '8px',
                                        color: '#6B7280'
                                    }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📭</div>
                                        <h4 style={{ margin: '0 0 10px 0', color: '#4B5563' }}>
                                            No hay acciones registradas
                                        </h4>
                                        <p>No se han realizado acciones en este bicicletero aún.</p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Resumen de acciones por tipo */}
                            {accionesBicicletero.length > 0 && (
                                <div style={{
                                    marginTop: '25px',
                                    padding: '20px',
                                    backgroundColor: '#F9FAFB',
                                    borderRadius: '8px',
                                    borderLeft: `4px solid ${bicicleteroSeleccionado.colorContenedor}`
                                }}>
                                    <h4 style={{ margin: '0 0 15px 0', color: '#4B5563' }}>
                                        📊 Resumen de Actividades
                                    </h4>
                                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                        {Object.entries(tiposAccion).map(([tipo, info]) => {
                                            const count = accionesBicicletero.filter(a => a.tipo === tipo).length;
                                            if (count === 0) return null;
                                            
                                            return (
                                                <div key={tipo} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '8px 12px',
                                                    backgroundColor: info.color + '15',
                                                    borderRadius: '8px'
                                                }}>
                                                    <span style={{ fontSize: '1.2rem' }}>
                                                        {info.icono}
                                                    </span>
                                                    <div>
                                                        <div style={{ fontSize: '0.9rem', color: info.color, fontWeight: '500' }}>
                                                            {info.nombre}
                                                        </div>
                                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1F2937' }}>
                                                            {count}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Estilos CSS */}
                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
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