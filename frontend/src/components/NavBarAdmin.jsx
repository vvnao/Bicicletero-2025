"use strict";

const NavBarAdmin = ({ sidebarHover }) => {
    return (
        <nav style={{
            height: '60px',
            backgroundColor: '#030d18ff',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            zIndex: 1100,
            borderBottom: '1px solid #2d3748',
            color: '#ffffff'
        }}>
            <div style={{
                marginLeft: sidebarHover ? '240px' : '80px',
                transition: 'margin-left 0.3s ease',
                fontWeight: 'bold',
                fontSize: '18px'
            }}>
                Panel Administrativo
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span>Usuario Admin</span>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#4a5568',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    👤
                </div>
            </div>
        </nav>
    );
};

export default NavBarAdmin;