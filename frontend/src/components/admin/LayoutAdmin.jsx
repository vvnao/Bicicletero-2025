// components/admin/LayoutAdmin.jsx - VERSIÓN MEJORADA
"use strict";
import { useState, useEffect } from "react";
import NavBarAdmin from "./NavBarAdmin";
import SidebarAdmin from "./SidebarAdmin";

const LayoutAdmin = ({ children }) => {
    // Función segura para cargar desde localStorage
    const loadSidebarState = () => {
        try {
            const saved = localStorage.getItem('sidebarState');
            return saved ? JSON.parse(saved) : false;
        } catch (error) {
            console.error('Error al cargar estado del sidebar:', error);
            return false;
        }
    };

    const [sidebarHover, setSidebarHover] = useState(loadSidebarState);

    // Guardar estado en localStorage
    useEffect(() => {
        try {
            localStorage.setItem('sidebarState', JSON.stringify(sidebarHover));
        } catch (error) {
            console.error('Error al guardar estado del sidebar:', error);
        }
    }, [sidebarHover]);

    return (
        <div style={{ 
            minHeight: '100vh', 
            backgroundColor: '#030d18ff',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <SidebarAdmin 
                sidebarHover={sidebarHover} 
                setSidebarHover={setSidebarHover} 
            />
            
            <NavBarAdmin sidebarHover={sidebarHover} />
            
            <div style={{
                marginLeft: sidebarHover ? '240px' : '80px',
                paddingTop: '80px',
                minHeight: '100vh',
                transition: 'margin-left 0.3s ease',
                position: 'relative',
                zIndex: 1,
                overflow: 'auto' // Cambié a 'auto' para scroll interno
            }}>
                <div style={{
                    padding: '20px',
                    minHeight: 'calc(100vh - 80px)',
                    backgroundColor: '#272e4b',
                    position: 'relative'
                }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default LayoutAdmin;