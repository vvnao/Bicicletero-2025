"use strict";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SidebarAdmin = ({ sidebarHover, setSidebarHover }) => {
    const [activeItem, setActiveItem] = useState('dashboard');
  const navigate = useNavigate(); 
    const mainMenuItems = [
        { name: 'Dashboard', path: '/admin/home', icon: '📊' },
        { name: 'Bicicleteros', path: '/home/admin/bicicletas', icon: '🚲' },
        { name: 'Guardias', path: '/home/admin/guardias', icon: '👮' },
        { name: 'Historial', path: '/home/admin/historial', icon: '📁' },
        { name: 'Repotes', path: '/home/admin/reportes', icon: '💬' },
        
        
    ];

    const handleNavigation = (path, name) => {
    setActiveItem(name.toLowerCase());
     console.log(`Navegando a: ${path}`);
        navigate(path);
   
};

    const handleLogout = () => {
        console.log('Cerrando sesión...');
          navigate("/auth/login", { replace: true });
    };

    return (
        <div 
            style={{
                width: sidebarHover ? '240px' : '80px',
                height: '100vh',
                backgroundColor: '#323955',
                position: 'fixed',
                left: 0,
                top: 0,
                transition: 'width 0.3s ease',
                overflow: 'hidden',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTopRightRadius: '50px', // Solo esquina superior derecha redondeada
                borderBottomRightRadius: '0', // Esquina inferior derecha sin redondear
                borderTopLeftRadius: '0', // Esquina superior izquierda sin redondear
                borderBottomLeftRadius: '0' // Esquina inferior izquierda sin redondear
            }}
            onMouseEnter={() => setSidebarHover(true)}
            onMouseLeave={() => setSidebarHover(false)}
        >
            {/* Sección superior */}
            <div>
                {/* Título "Smart" */}
                <div style={{
                    padding: '40px',
                    paddingTop: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarHover ? 'flex-start' : 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    marginBottom: '10px'
                }}>
                    <span style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#ffffff',
                        opacity: sidebarHover ? 1: 0,
                        transition: 'opacity 0.1s ease',
                        whiteSpace: 'nowrap'
                    }}>
                        Panel de <br/>
                        Control
                    </span>
                </div>

                {/* Menú principal */}
                <div style={{ padding: '10px 0' }}>
                    {mainMenuItems.map((item, index) => (
                        <div
                            key={index}
                            style={{
                                padding: '15px 25px',
                                margin: '7px 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                cursor: 'pointer',
                                color: '#ffffff',
                                transition: 'all 0.3s ease',
                                backgroundColor: activeItem === item.name.toLowerCase() ? '#272e4b' : 'transparent',
                              
                            }}
                            onClick={() => handleNavigation(item.path, item.name)}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#272e4b';
                                e.currentTarget.style.margin = '5px 20px';
                                e.currentTarget.style.padding = '15px 30px';
                                e.currentTarget.style.borderRadius = '70px 0 0 50px';
                                e.currentTarget.style.width = 'calc(100% + 40px)';
                                
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = activeItem === item.name.toLowerCase() ? '#272e4b' : 'transparent';
                                e.currentTarget.style.margin = '5px 0';
                                e.currentTarget.style.padding = '15px 20px';
                                e.currentTarget.style.borderRadius = '0';
                                e.currentTarget.style.width = '100%';
                                e.currentTarget.style.borderLeft = activeItem === item.name.toLowerCase() ? '3px solid #272e4b' : 'none';
                            }}
                        >
                            <span style={{ 
                                fontSize: '22px', 
                                minWidth: '28px',
                                display: 'flex',
                                justifyContent: 'center'
                            }}>
                                {item.icon}
                            </span>
                            <span style={{ 
                                opacity: sidebarHover ? 1 : 0,
                                transition: 'opacity 0.3s ease',
                                whiteSpace: 'nowrap',
                                fontSize: '16px',
                                fontWeight: '500'
                            }}>
                                {item.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sección inferior - Logout */}
            <div style={{
                borderTop: '1px solid rgba(255,255,255,0.1)',
                padding: '20px 0',
                marginTop: 'auto'
            }}>
                <div
                    style={{
                        padding: '15px 20px',
                        margin: '5px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        cursor: 'pointer',
                        color: '#ffffff',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                    }}
                    onClick={handleLogout}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#202d5fff';
                        e.currentTarget.style.margin = '5px -20px';
                        e.currentTarget.style.padding = '15px 35px';
                        e.currentTarget.style.borderRadius = '50px 0 0 50px';
                        e.currentTarget.style.width = 'calc(100% + 40px)';
                        e.currentTarget.style.borderLeft = '5px solid #ff6b6b';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.margin = '5px 0';
                        e.currentTarget.style.padding = '15px 20px';
                        e.currentTarget.style.borderRadius = '0';
                        e.currentTarget.style.width = '100%';
                        e.currentTarget.style.borderLeft = 'none';
                    }}
                >
                    <span style={{ 
                        fontSize: '22px', 
                        minWidth: '28px',
                        display: 'flex',
                        justifyContent: 'center',
                        color: '#ff6b6b'
                    }}>
                      -  
                    </span>
                    <span style={{ 
                        opacity: sidebarHover ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                        whiteSpace: 'nowrap',
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#ff6b6b'
                    }}>
                        Cerrar Sesión
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SidebarAdmin;