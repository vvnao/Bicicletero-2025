import { useNavigate } from "react-router-dom";
import { logout } from "@services/auth.service.js";
import { useState, useEffect } from "react";

function HomeAdmin() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarHover, setSidebarHover] = useState(false);

    useEffect(() => {
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.backgroundColor = '#272e4b';
        
        return () => {
            document.body.style.margin = '';
            document.body.style.padding = '';
            document.body.style.backgroundColor = '';
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/auth/login", { replace: true });
    };

    // Funciones de navegación
    const navigateToBicicletas = () => {
        navigate("/home/admin/bicicletas");
    };

    const navigateToGuardias = () => {
        navigate("/home/admin/guardias");
    };

    const navigateToHistorial = () => {
        navigate("/home/admin/historial");
    };

    const navigateToPerfil = () => {
        navigate("/home/admin/perfil");
    };

    return (
        <div style={{minHeight: '100vh', backgroundColor: '#272e4b', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0}}>
            {/* Navbar */}
            <nav style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', height: '60px', backgroundColor: '#272e4b', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <h1 style={{fontSize: '1.5rem', fontWeight: 'bold', margin: 0}}>Bicicletero UBB</h1>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                        <span style={{fontSize: '0.9rem', fontWeight: 'bold'}}>Administrador</span>
                        <span style={{fontSize: '0.8rem', opacity: 0.8}}>Admin</span>
                    </div>
                    <button style={{background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', padding: '5px', borderRadius: '4px'}}>🔔</button>
                    <button style={{padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem'}} onClick={handleLogout}>Cerrar sesión</button>
                </div>
            </nav>

            <div style={{display: 'flex', minHeight: 'calc(100vh - 60px)', backgroundColor: '#272e4b', marginTop: '60px'}}>
              {/* Sidebar con navegación */}
                    {sidebarOpen && (
                        <aside style={{ position: 'fixed', top: '60px', left: 0, width: sidebarHover ? '220px' : '60px', height: 'calc(100vh - 60px)', backgroundColor: '#323955', 
                            padding: '30px 10px', display: 'flex', flexDirection: 'column', overflowX: 'hidden', zIndex: 1000, transition: 'width 0.3s ease'
                        }} 
                        onMouseEnter={() => setSidebarHover(true)} 
                        onMouseLeave={() => setSidebarHover(false)}>
                        {/* Sección Bicicletas */}
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', padding: '8px 0', whiteSpace: 'nowrap', transition: 'color 0.2s', overflow: 'hidden', textOverflow: 'ellipsis'}} onClick={navigateToPerfil}>
                            <div style={{minWidth: '50px', height: '50px', backgroundColor: '#484f6b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>🚲</div>
                            <span style={{opacity: sidebarHover ? 1 : 0, pointerEvents: sidebarHover ? 'auto' : 'none', transition: 'opacity 0.3s ease', marginLeft: '10px'}}>Perfil</span>
                        </div>

                        <div style={{display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', padding: '8px 0', whiteSpace: 'nowrap', transition: 'color 0.2s', overflow: 'hidden', textOverflow: 'ellipsis'}} onClick={navigateToBicicletas}>
                            <div style={{minWidth: '50px', height: '50px', backgroundColor: '#484f6b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>🚲</div>
                            <span style={{opacity: sidebarHover ? 1 : 0, pointerEvents: sidebarHover ? 'auto' : 'none', transition: 'opacity 0.3s ease', marginLeft: '10px'}}>Bicicletas</span>
                        </div>

                        {/* Sección Guardias */}
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', padding: '8px 0', whiteSpace: 'nowrap', transition: 'color 0.2s', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '10px'}} onClick={navigateToGuardias}>
                            <div style={{minWidth: '50px', height: '50px', backgroundColor: '#484f6b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>🛡️</div>
                            <span style={{opacity: sidebarHover ? 1 : 0, pointerEvents: sidebarHover ? 'auto' : 'none', transition: 'opacity 0.3s ease', marginLeft: '10px'}}>Guardias</span>
                        </div>

                        {/* Sección Historial */}
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', padding: '8px 0', whiteSpace: 'nowrap', transition: 'color 0.2s', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '10px'}} onClick={navigateToHistorial}>
                            <div style={{minWidth: '50px', height: '50px', backgroundColor: '#484f6b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>📊</div>
                            <span style={{opacity: sidebarHover ? 1 : 0, pointerEvents: sidebarHover ? 'auto' : 'none', transition: 'opacity 0.3s ease', marginLeft: '10px'}}>Historial</span>
                        </div>

                        {/* Sección Reportes */}
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', padding: '8px 0', whiteSpace: 'nowrap', transition: 'color 0.2s', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '10px'}} onClick={navigateToReportes}>
                            <div style={{minWidth: '50px', height: '50px', backgroundColor: '#484f6b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>📋</div>
                            <span style={{opacity: sidebarHover ? 1 : 0, pointerEvents: sidebarHover ? 'auto' : 'none', transition: 'opacity 0.3s ease', marginLeft: '10px'}}>Reportes</span>
                        </div>
                    </aside>
                )}

                {/* Main Content */}
                <main style={{ 
                        flex: 1, padding: '20px', overflow: 'auto', backgroundColor: '#272e4b', marginLeft: sidebarOpen ? (sidebarHover ? '290px' : '80px') : '0',
                        transition: 'margin-left 0.3s ease'
                    }}>
                    {/* Header Section */}
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', padding: '25px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}>
                        <div style={{flex: 1}}>
                            <h2 style={{fontSize: '2.2rem', fontWeight: 'bold', color: '#1e40af', margin: '0 0 10px 0'}}>¡Buen día, Administrador!</h2>
                            <p style={{fontSize: '1.1rem', color: '#6b7280', fontStyle: 'italic', margin: 0}}>- Que tengas un excelente Lunes -</p>
                        </div>
                        <div style={{flex: 1, textAlign: 'right'}}>
                            <div style={{backgroundColor: '#f8fafc', padding: '18px', borderRadius: '10px', display: 'inline-block', border: '1px solid #e5e7eb'}}>
                                <h4 style={{margin: '0 0 12px 0', color: '#1f2937', fontSize: '1.2rem', fontWeight: 'bold'}}>Admin del Sistema</h4>
                                <p style={{margin: '6px 0', color: '#6b7280', fontSize: '0.95rem'}}>Bicicletero UBB - Chillán, Chile</p>
                                <p style={{margin: '6px 0', color: '#6b7280', fontSize: '0.95rem'}}>Fecha: {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px', marginBottom: '35px'}}>
                        {[
                            { number: '27', label: 'Bicicletas Registradas', tag: '#Estacionamiento', color: '#3b82f6' },
                            { number: '15', label: 'Usuarios Activos', tag: '#Sistema', color: '#10b981' },
                            { number: '8', label: 'Guardias Activos', tag: '#Turnos', color: '#f59e0b' },
                            { number: '3', label: 'Reportes Pendientes', tag: '#Soporte', color: '#ef4444' }
                        ].map((stat, index) => (
                            <div key={index} style={{backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center', borderLeft: `5px solid ${stat.color}`, transition: 'transform 0.2s ease, box-shadow 0.2s ease'}}>
                                <h3 style={{fontSize: '3rem', fontWeight: 'bold', color: '#1e40af', margin: '0 0 15px 0'}}>{stat.number}</h3>
                                <p style={{fontSize: '1rem', color: '#6b7280', margin: '0 0 15px 0', fontWeight: '500'}}>{stat.label}</p>
                                <span style={{backgroundColor: `${stat.color}15`, color: stat.color, padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold'}}>{stat.tag}</span>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default HomeAdmin;