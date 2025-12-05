"use strict";
import { useState } from "react";
import NavBarAdmin from "./NavBarAdmin";
import SidebarAdmin from "./SidebarAdmin";

const LayoutAdmin = ({ children }) => {
    const [sidebarHover, setSidebarHover] = useState(false);

    return (
        <div style={{ 
            minHeight: '100vh', 
            backgroundColor: '#030d18ff',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <NavBarAdmin sidebarHover={sidebarHover} />
            
            <div style={{ 
                display: 'flex', 
                flex: 1,
                marginTop: '60px'
            }}>
                <SidebarAdmin sidebarHover={sidebarHover} setSidebarHover={setSidebarHover} />
                
                <main style={{
                    flex: 1,
                    marginLeft: sidebarHover ? '240px' : '80px',
                    padding: '20px',
                    transition: 'margin-left 0.3s ease',
                    backgroundColor: '#afb2beff',
                    minHeight: 'calc(100vh - 60px)'
                }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default LayoutAdmin;