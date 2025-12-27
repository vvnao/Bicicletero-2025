"use strict";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
    FiBarChart2,
    FiHome,
    FiShield,
    FiArchive,
    FiFileText,
    FiLogOut
} from 'react-icons/fi';

const SidebarAdmin = ({ sidebarHover, setSidebarHover }) => {
    const [activeItem, setActiveItem] = useState('');
    const [hoveredItem, setHoveredItem] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const mainMenuItems = [
        {
            name: 'Dashboard',
            path: '/home/admin',
            icon: FiBarChart2
        },
        {
            name: 'Bicicleteros',
            path: '/home/admin/bicicletas',
            icon: FiHome
        },
        {
            name: 'Guardias',
            path: '/home/admin/guardias',
            icon: FiShield
        },
        {
            name: 'Historial',
            path: '/home/admin/historial',
            icon: FiArchive
        },
        {
            name: 'Reportes',
            path: '/home/admin/reportes',
            icon: FiFileText
        },
    ];

    useEffect(() => {
        let matchedItem = mainMenuItems.find(item => location.pathname === item.path);

        if (!matchedItem) {
            matchedItem = mainMenuItems.find(item =>
                location.pathname.startsWith(item.path + '/') ||
                location.pathname === item.path
            );
        }

        if (matchedItem) {
            setActiveItem(matchedItem.name.toLowerCase());
        } else {
            setActiveItem('');
        }
    }, [location.pathname]);

    const handleNavigation = (path, name) => {
        setActiveItem(name.toLowerCase());
        navigate(path);
    };

    const handleLogout = () => {
        // Considera limpiar tokens/localStorage aquí
        localStorage.removeItem('authToken'); // si usas tokens
        navigate("/auth/login", { replace: true });
    };

  const getMenuItemStyles = (itemName) => {
    const isActive = activeItem === itemName.toLowerCase();
    const isHovered = hoveredItem === itemName.toLowerCase();
    
    // Margen base
    let marginValue = '19px 15px';
    let width = 'calc(100% - 30px)';

    if (isActive) {
        marginValue = '19px 0 19px 15px'; // top, right, bottom, left
        width = 'calc(100% - 15px)';
    }
    
    if (isHovered && !isActive) {
        marginValue = '19px 0 19px 15px';
        width = 'calc(100% - 23px)';
    }

    let styles = {
        padding: '14px 18px',
        paddingTop: '14px',
        margin: marginValue, // Solo margin abreviado
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        cursor: 'pointer',
        color: '#ffffff',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: 'transparent',
        borderRadius: '12px 0 0 12px',
        position: 'relative',
        width: width,
    };

    if (isActive) {
        styles.backgroundColor = '#252e4b';
        styles.borderLeft = '4px solid #4a90e2';
        styles.boxShadow = '2px 0 12px rgba(0, 0, 0, 0.15)';
        styles.color = '#ffffff';
    } 
    
    if (isHovered && !isActive) {
        styles.backgroundColor = '#19213f2d';
        styles.borderRadius = '12px 8px 8px 12px';
    }

    return styles;
};

    return (
        <div
            style={{

                width: sidebarHover ? '240px' : '80px',
                height: '100vh',
                backgroundColor: '#323954',
                position: 'fixed',
                left: 0,
                top: 0,
                transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTopRightRadius: '20px',
                borderBottomRightRadius: '20px'
                // boxShadow: '3px 0 20px rgba(0, 0, 0, 0.15)',
            }}
            onMouseEnter={() => setSidebarHover(true)}
            onMouseLeave={() => setSidebarHover(false)}
        >
            <div>
                <div style={{
                    padding: '30px 20px',
                    paddingTop: '50px',
                    display: 'flex',

                    alignItems: 'center',
                    justifyContent: sidebarHover ? 'flex-start' : 'center',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    marginBottom: '30px'
                }}>
                    <div style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#ffffff',
                        opacity: sidebarHover ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                        whiteSpace: 'nowrap',
                        lineHeight: '1.4'
                    }}>
                        <div style={{ color: '#4a90e2', fontSize: '22px' }}>Panel</div>
                        <div>de Control</div>
                    </div>
                </div>

                <div style={{ padding: '0' }}>
                    {mainMenuItems.map((item, index) => {
                        const IconComponent = item.icon;
                        const isActive = activeItem === item.name.toLowerCase();
                        const isHovered = hoveredItem === item.name.toLowerCase();

                        return (
                            <div
                                key={index}
                                style={getMenuItemStyles(item.name)}
                                onClick={() => handleNavigation(item.path, item.name)}
                                onMouseEnter={() => setHoveredItem(item.name.toLowerCase())}
                                onMouseLeave={() => setHoveredItem(null)}
                            >
                                <div style={{
                                    minWidth: '24px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: isActive ? '#4a90e2' :
                                        isHovered ? '#ffffff' : '#a0a7c2',
                                    transition: 'color 0.2s ease',
                                    position: 'relative',
                                    zIndex: '2',
                                }}>
                                    <IconComponent size={23} />
                                </div>
                                <div style={{
                                    opacity: sidebarHover ? 1 : 0,
                                    transition: 'opacity 0.2s ease',
                                    whiteSpace: 'nowrap',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                    letterSpacing: '0.3px',
                                    color: isActive ? '#ffffff' :
                                        isHovered ? '#ffffff' : '#d1d5e7',
                                    position: 'relative',
                                    zIndex: '2'
                                }}>
                                    {item.name}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '20px 0',
                marginTop: 'auto'
            }}>
                <div
    style={{
        padding: '14px 20px',
        marginTop: '10px',
        marginRight: '15px',
        marginBottom: '10px',
        marginLeft: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        borderRadius: '12px',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
    }}
                    onClick={handleLogout}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
                    }}
                >
                    <div style={{
                        minWidth: '24px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: '#ff6b6b'
                    }}>
                        <FiLogOut size={18} />
                    </div>
                    <div style={{
                        opacity: sidebarHover ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                        whiteSpace: 'nowrap',
                        fontSize: '15px',
                        fontWeight: '500',
                        color: '#ff6b6b'
                    }}>
                        Cerrar Sesión
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SidebarAdmin;