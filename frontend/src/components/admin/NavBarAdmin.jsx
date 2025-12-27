"use strict";
import appLogo from "../../assets/UBB_ADMIN.png";

const NavBarAdmin = ({ sidebarHover }) => {
    return (
       <header style={{
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
    zIndex: 999,
    color: '#ffffff',
    borderBottom: '0.3px solid rgba(255, 255, 255, 0.1)', // ← Esta es mi recomendación
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    background: 'rgba(39, 46, 75, 0.95)'
}}>
            {/* Lado izquierdo - Título o logo */}
            <div style={{
                marginLeft: sidebarHover ? '250px' : '90px',
                transition: 'margin-left 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
            }}>
                {/* Logo más discreto */}
                <div style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#4fc3f7',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    🚲
                </div>
                
                {/* Título más sutil */}
                <div>
                    <div style={{
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#ffffff',
                        letterSpacing: '0.3px'
                    }}>
                        Panel de Administración
                    </div>
                    <div style={{
                        fontSize: '11px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                    }}>
                        Sistema de Gestión
                    </div>
                </div>
            </div>
            
            {/* Lado derecho - Perfil y notificaciones */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px' 
            }}>
                {/* Icono de notificaciones - más sutil */}
                <div style={{
                    position: 'relative',
                    cursor: 'pointer',
                    opacity: '0.8',
                    transition: 'opacity 0.2s ease'
                }}>
                
                </div>
                
                {/* Separador sutil */}
                <div style={{
                    height: '24px',
                    width: '1px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }}></div>
                
                {/* Perfil de usuario - más integrado */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    cursor: 'pointer',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s ease',
                    ':hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                    }
                }}>
                    <div>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#ffffff',
                            textAlign: 'right'
                        }}>
                            Administrador
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: 'rgba(255, 255, 255, 0.5)',
                            textAlign: 'right'
                        }}>
                            admin@ubb.cl
                        </div>
                    </div>
                    
                    {/* Avatar más sutil */}
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: '500',
                        color: 'white',
                        border: '2px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}>
                        AU
                    </div>
                    
                    {/* Flecha dropdown sutil */}
                    <div style={{
                        fontSize: '10px',
                        color: 'rgba(255, 255, 255, 0.4)',
                        marginLeft: '4px'
                    }}>
                        ▼
                    </div>
                </div>
            </div>
        </header>
    );
};

export default NavBarAdmin;