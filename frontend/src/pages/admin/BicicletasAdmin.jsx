// BicicletasAdmin.jsx - VERSIÓN COMPLETA Y FUNCIONAL
"use strict";
import { useState, useEffect, useCallback } from "react";
import LayoutAdmin from "../../components/admin/LayoutAdmin";
import { useNavigate } from "react-router-dom";
import { getAuthToken } from '../../helpers/authHelper';
import bikerackService from '../../services/bikerack.service.js';

// Importa las imágenes
import iconoCentral from '../../assets/BicicleteroCentral.png';
import iconoNorte from '../../assets/BicicleteroNorte.png';
import iconoSur from '../../assets/BicicleteroSur.png';
import iconoEste from '../../assets/BicicleteroEste.png';

function BicicletasAdmin() {
    const navigate = useNavigate();
    
    // Estados
    const [loading, setLoading] = useState(true);
    const [bicicleteros, setBicicleteros] = useState([]);
    const [bicicleteroSeleccionado, setBicicleteroSeleccionado] = useState(null);
    const [accionesBicicletero, setAccionesBicicletero] = useState([]);
    const [cargandoAcciones, setCargandoAcciones] = useState(false);
    const [error, setError] = useState(null);
    
    // Tipos de acciones
    const tiposAccion = {
        'ingreso': { nombre: 'Ingreso Usuario', color: '#10B981', icono: '⬇️' },
        'salida': { nombre: 'Salida Usuario', color: '#EF4444', icono: '⬆️' },
        'reserva': { nombre: 'Reserva Realizada', color: '#3B82F6', icono: '📅' },
        'cancelacion': { nombre: 'Reserva Cancelada', color: '#F59E0B', icono: '❌' },
        'asignacion': { nombre: 'Guardia Asignado', color: '#8B5CF6', icono: '🛡️' },
        'registro': { nombre: 'Bicicleta Registrada', color: '#10B981', icono: '🚲' },
        'incidente': { nombre: 'Reporte Incidente', color: '#DC2626', icono: '⚠️' },
        'default': { nombre: 'Movimiento', color: '#6B7280', icono: '📝' }
    };

    // Asignar iconos según el nombre del bicicletero
    const asignarIcono = (nombre) => {
        if (!nombre) return iconoNorte;
        const nombreLower = nombre.toLowerCase();
        if (nombreLower.includes('norte')) return iconoSur;
        if (nombreLower.includes('sur')) return iconoEste;
        if (nombreLower.includes('este')) return iconoCentral;
        return iconoNorte;
    };

    // Determinar color de estado
    const getEstadoColor = (estado) => {
        if (!estado) return '#9CA3AF';
        const est = estado.toLowerCase();
        switch(est) {
            case 'lleno': return '#DC2626';
            case 'casi lleno': return '#F59E0B';
            case 'activo': return '#10B981';
            case 'vacío': 
            case 'vacio': return '#6B7280';
            default: return '#9CA3AF';
        }
    };

    // Función para obtener bicicleteros
    const fetchBicicleteros = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log("🔄 Obteniendo bicicleteros...");
            const bicicleterosData = await bikerackService.getAll();
            console.log("✅ Bicicleteros obtenidos:", bicicleterosData);
            
            if (Array.isArray(bicicleterosData) && bicicleterosData.length > 0) {
                setBicicleteros(bicicleterosData);
            } else {
                setError("No se encontraron bicicleteros en el sistema");
                setBicicleteros([]);
            }
            
        } catch (error) {
            console.error("❌ Error cargando bicicleteros:", error);
            let errorMessage = 'Error al cargar bicicleteros';
            if (error.response) {
                errorMessage = `Error ${error.response.status}: ${error.response.data?.message || 'Error del servidor'}`;
            } else if (error.request) {
                errorMessage = 'No se pudo conectar con el servidor';
            } else {
                errorMessage = error.message;
            }
            setError(errorMessage);
            setBicicleteros([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch acciones - Versión mejorada
    const fetchAcciones = useCallback(async (bicicleteroId) => {
        if (!bicicleteroId) {
            console.log("⚠️ No hay bicicletero ID");
            setAccionesBicicletero([]);
            return;
        }
        
        try {
            setCargandoAcciones(true);
            console.log(`🔍 Buscando acciones para bicicletero ID: ${bicicleteroId}`);
            
            const resultado = await bikerackService.getBikerackActions(bicicleteroId);
            console.log(`📊 Resultado de acciones:`, resultado);
            
            if (resultado && Array.isArray(resultado) && resultado.length > 0) {
                // Formatear las acciones para la tabla
                const accionesFormateadas = resultado.map((accion, index) => {
                    // Determinar tipo basado en descripción si no viene
                    let tipo = accion.tipo || 'default';
                    const descLower = (accion.descripcion || '').toLowerCase();
                    
                    if (descLower.includes('reserva') && descLower.includes('cancel')) {
                        tipo = 'cancelacion';
                    } else if (descLower.includes('reserva')) {
                        tipo = 'reserva';
                    } else if (descLower.includes('ingreso') || descLower.includes('check-in')) {
                        tipo = 'ingreso';
                    } else if (descLower.includes('salida') || descLower.includes('check-out')) {
                        tipo = 'salida';
                    }
                    
                    return {
                        id: accion.id || `temp-${index}`,
                        tipo: tipo,
                        descripcion: accion.descripcion || 'Sin descripción',
                        usuario: accion.usuario || 'Sistema',
                        fecha: accion.fecha || new Date().toISOString(),
                        rut: accion.rut || 'N/A',
                        bicicleta: accion.bicicleta || 'N/A',
                        guardia: accion.guardia || null,
                        espacio: accion.espacio || 'N/A',
                        reservationCode: accion.reservationCode || null
                    };
                });
                
                console.log(`✅ ${accionesFormateadas.length} acciones formateadas`);
                setAccionesBicicletero(accionesFormateadas);
            } else {
                console.log("📭 No hay acciones disponibles");
                setAccionesBicicletero([]);
            }
        } catch (error) {
            console.error('❌ Error en fetchAcciones:', error);
            setAccionesBicicletero([]);
        } finally {
            setCargandoAcciones(false);
        }
    }, []);

    // Handlers
    const handleSeleccionarBicicletero = (bicicletero) => {
        console.log("🎯 Bicicletero seleccionado:", bicicletero);
        setBicicleteroSeleccionado(bicicletero);
        fetchAcciones(bicicletero.id);
    };

    const handleRefrescarAcciones = () => {
        if (bicicleteroSeleccionado) {
            console.log("🔄 Refrescando acciones...");
            fetchAcciones(bicicleteroSeleccionado.id);
        }
    };

    const handleRecargarTodo = () => {
        console.log("🔄 Recargando todo...");
        fetchBicicleteros();
    };

    // Componentes auxiliares
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

    const ErrorDisplay = ({ message, onRetry }) => (
        <div style={{
            backgroundColor: '#FEE2E2',
            border: '2px solid #DC2626',
            borderRadius: '12px',
            padding: '30px',
            margin: '20px 0',
            textAlign: 'center'
        }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⚠️</div>
            <h3 style={{ color: '#DC2626', margin: '0 0 10px 0' }}>Error al cargar datos</h3>
            <p style={{ color: '#7F1D1D', margin: '0 0 20px 0' }}>{message}</p>
            <button 
                onClick={onRetry}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#DC2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500'
                }}
            >
                🔄 Reintentar
            </button>
        </div>
    );

    // Efectos
    useEffect(() => {
        console.log("🚀 Componente BicicletasAdmin montado");
        const token = getAuthToken();
        
        if (!token) {
            setError('No estás autenticado. Redirigiendo...');
            setTimeout(() => navigate('/auth/login'), 2000);
            return;
        }
        
        fetchBicicleteros();
    }, [fetchBicicleteros, navigate]);

    useEffect(() => {
        if (bicicleteros.length > 0 && !bicicleteroSeleccionado) {
            const primerBicicletero = bicicleteros[0];
            console.log("🎯 Auto-seleccionando primer bicicletero:", primerBicicletero);
            setBicicleteroSeleccionado(primerBicicletero);
            fetchAcciones(primerBicicletero.id);
        }
    }, [bicicleteros, bicicleteroSeleccionado, fetchAcciones]);

    // Render
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
                            color: '#ffffff',
                            margin: 0
                        }}>
                            Gestión de Bicicleteros
                        </h1>
                        <div style={{ 
                            fontSize: '0.8rem', 
                            color: '#9CA3AF',
                            marginTop: '5px'
                        }}>
                            {bicicleteros.length} bicicleteros registrados
                        </div>
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
                                fontWeight: '500'
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
                                fontWeight: '500'
                            }}
                        >
                            {loading ? '↻ Cargando...' : '↻ Actualizar Todo'}
                        </button>
                    </div>
                </div>

                {error && <ErrorDisplay message={error} onRetry={handleRecargarTodo} />}

                {/* Grid de bicicleteros */}
                {bicicleteros.length > 0 ? (
                    <>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '20px',
                            marginBottom: '30px'
                        }}>
                            {bicicleteros.map((bicicletero) => {
                                const isSelected = bicicleteroSeleccionado?.id === bicicletero.id;
                                const iconoBicicletero = asignarIcono(bicicletero.name);
                                
                                return (
                                    <div
                                        key={bicicletero.id}
                                        onClick={() => handleSeleccionarBicicletero(bicicletero)}
                                        style={{
                                            backgroundColor: '#ffffff',
                                            borderRadius: '16px',
                                            cursor: 'pointer',
                                            border: isSelected ? `3px solid ${bicicletero.colorContenedor}` : '2px solid #E5E7EB',
                                            boxShadow: isSelected ? `0 8px 20px ${bicicletero.colorContenedor}50` : '0 2px 8px rgba(0,0,0,0.1)',
                                            transition: 'all 0.3s ease',
                                            transform: isSelected ? 'translateY(-5px)' : 'none',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div style={{
                                            backgroundColor: bicicletero.colorContenedor,
                                            padding: '15px 20px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <h3 style={{
                                                margin: 0,
                                                fontSize: '1.2rem',
                                                color: 'white',
                                                fontWeight: '700'
                                            }}>
                                                {bicicletero.name}
                                            </h3>
                                            <span style={{
                                                padding: '5px 12px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                color: getEstadoColor(bicicletero.status),
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: '700',
                                                textTransform: 'uppercase'
                                            }}>
                                                {bicicletero.status}
                                            </span>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            padding: '20px',
                                            backgroundColor: 'white'
                                        }}>
                                            <img 
                                                src={iconoBicicletero} 
                                                alt={bicicletero.name}
                                                style={{
                                                    width: '100px',
                                                    height: '100px',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                        </div>
                                        
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-around',
                                            padding: '15px 20px',
                                            backgroundColor: 'white',
                                            borderTop: '2px solid #F3F4F6'
                                        }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', marginBottom: '5px' }}>Capacidad</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1F2937' }}>{bicicletero.capacidad || 0}</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', marginBottom: '5px' }}>Ocupados</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#DC2626' }}>{bicicletero.occupied || 0}</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', marginBottom: '5px' }}>Libres</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10B981' }}>{bicicletero.free || 0}</div>
                                            </div>
                                        </div>

                                        <div style={{ padding: '10px 20px 20px 20px', backgroundColor: 'white', borderTop: '2px solid #F3F4F6' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Ocupación</span>
                                                <span style={{ 
                                                    fontSize: '0.8rem', 
                                                    fontWeight: '600',
                                                    color: bicicletero.occupationPercentage >= 80 ? '#DC2626' : 
                                                           bicicletero.occupationPercentage >= 50 ? '#F59E0B' : '#10B981'
                                                }}>
                                                    {bicicletero.occupationPercentage || 0}%
                                                </span>
                                            </div>
                                            <div style={{ height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${Math.min(bicicletero.occupationPercentage || 0, 100)}%`,
                                                    backgroundColor: bicicletero.occupationPercentage >= 80 ? '#DC2626' : 
                                                                   bicicletero.occupationPercentage >= 50 ? '#F59E0B' : '#10B981',
                                                    borderRadius: '4px',
                                                    transition: 'width 0.5s ease'
                                                }}></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* TABLA DE ACCIONES */}
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
                                        <div style={{ marginTop: '8px', color: '#6B7280', fontSize: '0.9rem' }}>
                                            {bicicleteroSeleccionado.ubicacion || 'Sin ubicación especificada'}
                                        </div>
                                    </div>
                                    
                                    <div style={{ fontSize: '0.85rem', color: '#6B7280', backgroundColor: '#F3F4F6', padding: '4px 10px', borderRadius: '6px' }}>
                                        ID: {bicicleteroSeleccionado.id}
                                    </div>
                                </div>
                                
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '15px'
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
                                        <>
                                            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                                    <thead>
                                                        <tr style={{ backgroundColor: '#F9FAFB' }}>
                                                            <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#4B5563', borderBottom: '2px solid #E5E7EB' }}>Tipo</th>
                                                            <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#4B5563', borderBottom: '2px solid #E5E7EB' }}>Usuario</th>
                                                            <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#4B5563', borderBottom: '2px solid #E5E7EB' }}>Código Reserva</th>
                                                            <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#4B5563', borderBottom: '2px solid #E5E7EB' }}>Detalles</th>
                                                            <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#4B5563', borderBottom: '2px solid #E5E7EB' }}>Fecha/Hora</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {accionesBicicletero.map((accion, index) => {
                                                            const tipoInfo = tiposAccion[accion.tipo] || tiposAccion.default;
                                                            
                                                            return (
                                                                <tr key={accion.id || index} style={{
                                                                    borderBottom: '1px solid #E5E7EB',
                                                                    backgroundColor: index % 2 === 0 ? 'white' : '#F9FAFB'
                                                                }}>
                                                                    <td style={{ padding: '12px 15px', verticalAlign: 'top' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                            <span style={{ fontSize: '1.2rem' }}>{tipoInfo.icono}</span>
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
                                                                        <div style={{ fontWeight: '500', color: '#1F2937' }}>
                                                                            👤 {accion.usuario}
                                                                        </div>
                                                                        {accion.rut && accion.rut !== 'N/A' && (
                                                                            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                                                                                RUT: {accion.rut}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td style={{ padding: '12px 15px', verticalAlign: 'top' }}>
                                                                        {accion.reservationCode ? (
                                                                            <div style={{ 
                                                                                padding: '4px 8px', 
                                                                                backgroundColor: '#F3F4F6',
                                                                                borderRadius: '6px',
                                                                                fontFamily: 'monospace',
                                                                                fontSize: '0.85rem'
                                                                            }}>
                                                                                {accion.reservationCode}
                                                                            </div>
                                                                        ) : (
                                                                            <span style={{ color: '#9CA3AF' }}>Sin código</span>
                                                                        )}
                                                                    </td>
                                                                    <td style={{ padding: '12px 15px', verticalAlign: 'top' }}>
                                                                        <div style={{ marginBottom: '4px', color: '#1F2937' }}>
                                                                            {accion.descripcion}
                                                                        </div>
                                                                        {accion.bicicleta && accion.bicicleta !== 'N/A' && (
                                                                            <div style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '2px' }}>
                                                                                <strong>Bicicleta:</strong> {accion.bicicleta}
                                                                            </div>
                                                                        )}
                                                                        {accion.espacio && (
                                                                            <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                                                                                <strong>Espacio:</strong> {accion.espacio}
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
                                        </>
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
                                            <p>No se han realizado movimientos en este bicicletero aún.</p>
                                            <button 
                                                onClick={handleRefrescarAcciones}
                                                style={{
                                                    marginTop: '15px',
                                                    padding: '8px 16px',
                                                    backgroundColor: '#3B82F6',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                🔄 Intentar de nuevo
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                ) : !loading && !error && (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        marginTop: '20px'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🚲</div>
                        <h3 style={{ color: '#4B5563', margin: '0 0 10px 0' }}>No hay bicicleteros registrados</h3>
                        <p style={{ color: '#6B7280', marginBottom: '20px' }}>
                            Parece que no hay bicicleteros disponibles en el sistema.
                        </p>
                        <button 
                            onClick={handleRecargarTodo}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#3B82F6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            🔄 Recargar
                        </button>
                    </div>
                )}

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