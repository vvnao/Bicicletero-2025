"use strict";
import { useState, useEffect } from "react";
import NavBarGuardia from "./NavBarGuardia";
import SidebarGuardia from "./SidebarGuardia";

const LayoutGuardia = ({ children }) => {
    const loadSidebarState = () => {
        try {
            const saved = localStorage.getItem('sidebarState');
            return saved ? JSON.parse(saved) : false;
        } catch (error) {
            console.error('Error al cargar estado del sidebar:', error);
            return false;
        }
    };

    const [sidebarHover, setSidebarHover] = useState(loadSidebarState());

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            try {
                localStorage.setItem('sidebarState', JSON.stringify(sidebarHover));
            } catch (error) {
                console.error('Error al guardar estado del sidebar:', error);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [sidebarHover]);

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#252e4b',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <SidebarGuardia
                sidebarHover={sidebarHover}
                setSidebarHover={setSidebarHover}
            />

            <NavBarGuardia sidebarHover={sidebarHover} />

            
            <SidebarGuardia
                sidebarHover={sidebarHover}
                setSidebarHover={setSidebarHover}
            />

            <NavBarGuardia sidebarHover={sidebarHover} />

            <main style={{
                marginLeft: sidebarHover ? '240px' : '80px',
                paddingTop: '80px',
                minHeight: '100vh',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'auto',
                backgroundColor: '#252e4b',
            }}>
                <div style={{
                    padding: '24px',
                    minHeight: 'calc(100vh - 80px)',
                    backgroundColor: '#252e4b',
                    borderRadius: '12px 0 0 0',
                    boxShadow: '0 4px 6px #252e4b'
                }}>
                    {children}  
                </div>
            </main>
        </div>
    );
};

export default LayoutGuardia;