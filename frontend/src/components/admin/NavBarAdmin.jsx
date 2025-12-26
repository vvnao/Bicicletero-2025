"use strict";
import appLogo from "../../assets/UBB_ADMIN.png";

const NavBarAdmin = ({ sidebarHover }) => {
    return (
        <nav style={{
            height: '70px',
            backgroundColor: '#272e4b',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 30px',
            zIndex: 900,
            boxShadow: '0 2px 15px rgba(0, 0, 0, 0.1)',
            color: '#ffffff',
            borderBottom: 'none'
        }}>
            {/* Lado izquierdo - Título o logo */}
            <div style={{
                marginLeft: sidebarHover ? '250px' : '90px',
                transition: 'margin-left 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
            }}>
                {/* Logo o ícono */}
                <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#3a4266',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#4fc3f7'
                }}>
                    B
                </div>
                
                {/* Título */}
                <div>
                    <div style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#ffffff'
                    }}>
                        Bicicletero App
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: '#b0b7d6',
                        opacity: '0.8'
                    }}>
                        Sistema de gestión
                    </div>
                </div>
            </div>
            
            {/* Lado derecho - Perfil y notificaciones */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '25px' 
            }}>
                {/* Icono de notificaciones */}
                <div style={{
                    position: 'relative',
                    cursor: 'pointer'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#3a4266',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        transition: 'all 0.3s ease'
                    }}>
                        🔔
                    </div>
                    {/* Indicador de notificaciones */}
                    <div style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        width: '18px',
                        height: '18px',
                        backgroundColor: '#ff4757',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: 'white'
                    }}>
                        3
                    </div>
                </div>
                
                {/* Separador */}
                <div style={{
                    height: '30px',
                    width: '1px',
                    backgroundColor: '#3a4266'
                }}></div>
                
                {/* Perfil de usuario */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    cursor: 'pointer'
                }}>
                    <div>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#ffffff',
                            textAlign: 'right'
                        }}>
                            Admin User
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: '#b0b7d6',
                            textAlign: 'right'
                        }}>
                            Administrador
                        </div>
                    </div>
                    
                    {/* Avatar */}
                    <div style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: 'white',
                        border: '3px solid #3a4266',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        AU
                    </div>
                    
                    {/* Flecha dropdown */}
                    <div style={{
                        fontSize: '12px',
                        color: '#b0b7d6'
                    }}>
                        ▼
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBarAdmin;