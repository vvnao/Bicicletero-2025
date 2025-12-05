"use strict";
import { useState } from "react";

const SidebarAdmin = ({ sidebarHover, setSidebarHover }) => {
    const [activeItem, setActiveItem] = useState('dashboard');

    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: '📊' },
        { name: 'Guardias', path: '/admin/guardias', icon: '👮' },
        { name: 'Usuarios', path: '/admin/usuarios', icon: '👥' },
        { name: 'Reportes', path: '/admin/reportes', icon: '📈' },
    ];

    const handleNavigation = (path, name) => {
        setActiveItem(name.toLowerCase());
        // Aquí iría tu navegación (react-router-dom)
        console.log(`Navegando a: ${path}`);
    };

    return (
        <div 
            style={{
                width: sidebarHover ? '240px' : '80px',
                height: 'calc(100vh - 60px)',
                backgroundColor: '#030d18ff',
                position: 'fixed',
                left: 0,
                top: '60px',
                transition: 'width 0.3s ease',
                overflow: 'hidden',
                zIndex: 1000
            }}
            onMouseEnter={() => setSidebarHover(true)}
            onMouseLeave={() => setSidebarHover(false)}
        >
            <div style={{ padding: '20px 0' }}>
                {menuItems.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            padding: '12px 20px',
                            margin: '0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                            color: '#ffffff',
                            transition: 'all 0.3s ease',
                            backgroundColor: activeItem === item.name.toLowerCase() ? '#202d5fff' : 'transparent'
                        }}
                        onClick={() => handleNavigation(item.path, item.name)}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#202d5fff';
                            e.currentTarget.style.margin = '0 -20px';
                            e.currentTarget.style.padding = '15px 35px';
                            e.currentTarget.style.borderRadius = '50px 0 0 50px';
                            e.currentTarget.style.width = 'calc(100% + 40px)';
                            e.currentTarget.style.borderLeft = '5px solid #ffffff';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = activeItem === item.name.toLowerCase() ? '#202d5fff' : 'transparent';
                            e.currentTarget.style.margin = '0';
                            e.currentTarget.style.padding = '12px 20px';
                            e.currentTarget.style.borderRadius = '0';
                            e.currentTarget.style.width = '100%';
                            e.currentTarget.style.borderLeft = 'none';
                        }}
                    >
                        <span style={{ fontSize: '20px', minWidth: '24px' }}>
                            {item.icon}
                        </span>
                        <span style={{ 
                            opacity: sidebarHover ? 1 : 0,
                            transition: 'opacity 0.3s ease',
                            whiteSpace: 'nowrap'
                        }}>
                            {item.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SidebarAdmin;
