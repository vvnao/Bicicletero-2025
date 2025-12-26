"use strict";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    FiHome,
    FiUsers,
    FiFileText,
    FiBarChart2,
    FiCalendar,
    FiSettings,
    FiLogOut
} from 'react-icons/fi'; // Feather Icons (limpios)

import {
    MdDashboard,
    MdPeople,
    MdHistory,
    MdReport,
    MdSettings
} from 'react-icons/md';
const SidebarAdmin = ({ sidebarHover, setSidebarHover }) => {
    const [activeItem, setActiveItem] = useState('');
    const [hoveredItem, setHoveredItem] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const mainMenuItems = [

        { name: 'Dashboard', path: '/home/admin', icon: <FiBarChart2 /> },
        { name: 'Bicicleteros', path: '/home/admin/bicicletas', icon: <FiHome /> },
        { name: 'Guardias', path: '/home/admin/guardias', icon: <FiUsers /> },
        { name: 'Historial', path: '/home/admin/historial', icon: <FiFileText /> },
        { name: 'Repotes', path: '/home/admin/reportes', icon: <FiCalendar /> },
    ];
    // Sincroniza el ítem activo con la ruta actual
    useEffect(() => {
        console.log('Ruta actual:', location.pathname);

        let matchedItem = null;
        matchedItem = mainMenuItems.find(item => location.pathname === item.path);

        if (!matchedItem) {
            matchedItem = mainMenuItems.find(item =>
                location.pathname.startsWith(item.path + '/') ||
                location.pathname === item.path
            );
        }

        console.log('Ítem encontrado:', matchedItem);

        if (matchedItem) {
            setActiveItem(matchedItem.name.toLowerCase());
        } else {
            setActiveItem('');
        }
    }, [location.pathname]);

    const handleNavigation = (path, name) => {
        setActiveItem(name.toLowerCase());
        console.log(`Navegando a: ${path}`);
        navigate(path);
    };

    const handleLogout = () => {
        console.log('Cerrando sesión...');
        navigate("/auth/login", { replace: true });
    };

    const getMenuItemStyles = (itemName) => {
        const isActive = activeItem === itemName.toLowerCase();
        const isHovered = hoveredItem === itemName.toLowerCase();

        let styles = {
            padding: '15px 25px',
            margin: '17px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            cursor: 'pointer',
            color: '#ffffff',
            transition: 'all 0.3s ease',
            backgroundColor: isActive ? '#272e4b' : 'transparent',
            borderLeft: 'none', // Removemos el borde izquierdo
        };

        // Estilo PARA ÍTEM ACTIVO (siempre visible)
        if (isActive) {
            styles.backgroundColor = '#272e4b';
            styles.margin = '5px 20px 5px 0'; // Margen derecho para el efecto "sobresalido"
            styles.padding = '15px 30px';
            styles.borderRadius = '70px 0 0 50px';
            styles.width = 'calc(100% + 20px)';
            styles.borderLeft = 'none';
            styles.position = 'relative';
            styles.zIndex = '1';
        }

        // Estilo PARA HOVER (solo si no está activo)
        else if (isHovered) {
            styles.backgroundColor = '#272e4b7a';
            styles.margin = '7px 20px';
            styles.padding = '15px 30px';
            styles.borderRadius = '70px 0 0 50px';
            styles.width = 'calc(100% + 40px)';
        }

        return styles;
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
                borderTopRightRadius: '50px',
                borderBottomRightRadius: '0',
                borderTopLeftRadius: '0',
                borderBottomLeftRadius: '0'
            }}
            onMouseEnter={() => setSidebarHover(true)}
            onMouseLeave={() => setSidebarHover(false)}
        >
            <div>
                <div style={{
                    padding: '40px',
                    paddingTop: '77px',
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
                        opacity: sidebarHover ? 1 : 0,
                        transition: 'opacity 0.1s ease',
                        whiteSpace: 'nowrap'
                    }}>
                        Panel de <br />
                        Control
                    </span>
                </div>

                <div style={{ padding: '10px  0.4rem' }}>
                    {mainMenuItems.map((item, index) => (
                        <div
                            key={index}
                            style={getMenuItemStyles(item.name)}
                            onClick={() => handleNavigation(item.path, item.name)}
                            onMouseEnter={() => setHoveredItem(item.name.toLowerCase())}
                            onMouseLeave={() => setHoveredItem(null)}
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

            <div style={{
                borderTop: '1px solid rgba(13, 71, 136, 0.1)',
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
                        e.currentTarget.style.backgroundColor = '#020a2bff';
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