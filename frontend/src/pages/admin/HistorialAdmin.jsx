import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HistorialAdmin() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarHover, setSidebarHover] = useState(false);
    const [activeHistory, setActiveHistory] = useState('bicicletas');
    const navigate = useNavigate();

    const handleLogout = () => {
  
        console.log('Cerrando sesión...');
    };

    const handleGoToHome = () => {
        navigate('/home/admin'); 
    };


    const sidebarStyle = {
        position: 'fixed',
        top: '60px',
        left: 0,
        width: sidebarHover ? '240px' : '80px',
        height: 'calc(100vh - 60px)',
        backgroundColor: '#323955',
        padding: '30px 10px',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        zIndex: 1000,
        transition: 'width 0.3s ease'
    };

    const buttonStyle = {
        width: '100%',
        padding: '12px 8px',
        marginBottom: '15px',
        backgroundColor: '#272e4b',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: sidebarHover ? '14px' : '12px',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarHover ? 'flex-start' : 'center',
        gap: '10px'
    };

    const activeButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#1e90ff',
        fontWeight: 'bold'
    };

    const contentStyle = {
        marginLeft: sidebarOpen ? (sidebarHover ? '240px' : '80px') : '0',
        padding: '20px',
        transition: 'margin-left 0.3s ease',
        minHeight: 'calc(100vh - 60px)',
        backgroundColor: '#f5f5f5'
    };

    const renderHistoryContent = () => {
        switch(activeHistory) {
            case 'bicicletas':
                return (
                    <div>
                        <h2>Historial de Bicicletas </h2>
                        <p>consultar un historial de ingresos y salidas por fecha, usuario o bicicleta.</p>
                        {/* tabla/listado del historial de bicicletas (me falta)*/}
                    </div>
                );
            case 'usuarios':
                return (
                    <div>
                        <h2>Historial de Usuarios</h2>
                        <p>Registro de solicitudes de registro y cambios de estado</p>
                        {/*  la tabla/listado del historial de usuarios (me falta) */}
                    </div>
                );
            case 'sistema':
                return (
                    <div>
                        <h2>Historial de los guardias</h2>
                        <p>podrá asignar guardias a cada bicicletero según corresponda. Esta funcionalidad estará disponible en una sección donde el administrador podrá visualizar<br/>
                            los bicicleteros registrados y seleccionar los guardias encargados de cada uno. El administrador podrá modificar o actualizar las asignaciones cuando sea necesario.</p>
                        {/* la tabla/listado del historial de los guardias(me falta) */}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div style={{minHeight: '100vh', backgroundColor: '#272e4b', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0}}>
            {/* Navbar */}
            <nav style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '0 20px', 
                height: '60px', 
                backgroundColor: '#272e4b', 
                color: 'white', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1100
            }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <h1 style={{fontSize: '1.5rem', fontWeight: 'bold', margin: 0}}>Bicicletero UBB</h1>

                     {/* Botón Volver al Home */}
                    <button 
                        onClick={handleGoToHome}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'background-color 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                    >
                        <span>🏠</span>
                        Volver al Home
                    </button>
                </div>


                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                        <span style={{fontSize: '0.9rem', fontWeight: 'bold'}}>Administrador</span>
                        <span style={{fontSize: '0.8rem', opacity: 0.8}}>Admin</span>
                    </div>
                    <button style={{
                        background: 'none', 
                        border: 'none', 
                        color: 'white', 
                        fontSize: '1.2rem', 
                        cursor: 'pointer', 
                        padding: '5px', 
                        borderRadius: '4px'
                    }}>
                        🔔
                    </button>
                    <button style={{
                        padding: '8px 16px', 
                        backgroundColor: '#ef4444', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer', 
                        fontSize: '0.9rem'
                    }} 
                    onClick={handleLogout}>
                        Cerrar sesión
                    </button>
                </div>
            </nav>

            {/* Contenido principal con sidebar */}
            <div style={{
                display: 'flex', 
                minHeight: 'calc(100vh - 60px)', 
                backgroundColor: '#272e4b', 
                marginTop: '60px'
            }}>
                {/* Sidebar con navegación */}
                {sidebarOpen && (
                    <aside 
                        style={sidebarStyle}
                        onMouseEnter={() => setSidebarHover(true)} 
                        onMouseLeave={() => setSidebarHover(false)}
                    >
                        {/* Botón 1: Historial de Bicicletas */}
                        <button 
                            style={activeHistory === 'bicicletas' ? activeButtonStyle : buttonStyle}
                            onClick={() => setActiveHistory('bicicletas')}
                            title="Historial de Bicicletas"
                        >
                            <span>🚲</span>
                            {sidebarHover && <span>Bicicletas</span>}
                        </button>

                        {/* Botón 2: Historial de Usuarios */}
                        <button 
                            style={activeHistory === 'usuarios' ? activeButtonStyle : buttonStyle}
                            onClick={() => setActiveHistory('usuarios')}
                            title="Historial de Solicitudes"
                        >
                            <span>👥</span>
                            {sidebarHover && <span>Usuarios</span>}
                        </button>

                        {/* Botón 3: Historial del Sistema */}
                        <button 
                            style={activeHistory === 'sistema' ? activeButtonStyle : buttonStyle}
                            onClick={() => setActiveHistory('sistema')}
                            title="Historial del Sistema"
                        >
                            <span>🛡️</span>
                            {sidebarHover && <span>Guardias</span>}
                        </button>
                    </aside>
                )}

                {/* Contenido principal */}
                <main style={contentStyle}>
                    {renderHistoryContent()}
                </main>
            </div>
        </div>
    );
}

export default HistorialAdmin;