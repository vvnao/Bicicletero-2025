"use strict";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBarAdmin from "./NavBarAdmin";
import SidebarAdmin from "./SidebarAdmin";

const LayoutAdmin = ({ children }) => {
    const [sidebarHover, setSidebarHover] = useState(false);
     const navigate = useNavigate();

    return (
        <div style={{ 
            minHeight: '100vh', 
            backgroundColor: '#030d18ff',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
        }}>
            {/* Sidebar primero para que esté por encima */}
            <SidebarAdmin sidebarHover={sidebarHover} setSidebarHover={setSidebarHover} />
            
            {/* Navbar después con z-index menor */}
            <NavBarAdmin sidebarHover={sidebarHover} />
            
            <main style={{
                marginLeft: sidebarHover ? '240px' : '80px',
                padding: '20px',
                paddingTop: '80px',
                transition: 'margin-left 0.3s ease',
                minHeight: '100vh',
                backgroundColor: '#272e4b',
                position: 'relative',
                zIndex: 1
            }}>
                {children}
            </main>
        </div>
    );
};

export default LayoutAdmin;