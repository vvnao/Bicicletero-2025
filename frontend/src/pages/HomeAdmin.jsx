import { useNavigate } from "react-router-dom";
import { logout } from "@services/auth.service.js";
import { useState } from "react";

function HomeAdmin() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate("/auth/login", { replace: true });
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#272e4b',
            fontFamily: 'Arial, sans-serif'
        }}>
            {/* Navbar */}
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 20px',
                height: '60px',
                backgroundColor: '#272e4b',
                color: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button 
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            padding: '5px 10px',
                            borderRadius: '4px'
                        }}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        ☰
                    </button>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                        Bicicletero UBB
                    </h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Administrador</span>
                        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Admin</span>
                    </div>
                    <button style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        padding: '5px',
                        borderRadius: '4px'
                    }}>
                        🔔
                    </button>
                    <button 
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                        onClick={handleLogout}
                    >
                        Cerrar sesión
                    </button>
                </div>
            </nav>

            <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
                {/*!- --------------------- Sidebar --------------------*/}
                {sidebarOpen && (
                    <aside style={{
                        width: '250px',
                        backgroundColor: '#323955',
                        borderRight: '1px solid #3b50a1ff',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                            <h3 style={{ margin: 0, color: '#ffffffff', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                Panel de Control
                            </h3>
                        </div>
                        
                        <nav style={{ flex: 1, padding: '10px 0' }}>
                            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                <li style={{ margin: 0 }}>
                                    <a href="#" style={{
                                        display: 'block',
                                        padding: '12px 20px',
                                        color: '#ffffffff',
                                        textDecoration: 'none',
                                        borderLeft: '3px solid transparent'
                                    }}>
                                        📊 Dashboard
                                    </a>
                                </li>
                                <li style={{ margin: 0 }}>
                                    <a href="#" style={{
                                        display: 'block',
                                        padding: '12px 20px',
                                        color: '#ffffffff',
                                        textDecoration: 'none',
                                        borderLeft: '3px solid transparent'
                                    }}>
                                        🚲 Bicicletas
                                    </a>
                                </li>
                                <li style={{ margin: 0 }}>
                                    <a href="#" style={{
                                        display: 'block',
                                        padding: '12px 20px',
                                        color: '#ffffffff',
                                        textDecoration: 'none',
                                        borderLeft: '3px solid transparent'
                                    }}>
                                        👥 Usuarios
                                    </a>
                                </li>
                                <li style={{ margin: 0 }}>
                                    <a href="#" style={{
                                        display: 'block',
                                        padding: '12px 20px',
                                        color: '#ffffffff',
                                        textDecoration: 'none',
                                        borderLeft: '3px solid transparent'
                                    }}>
                                        🛡️ Guardias
                                    </a>
                                </li>
                                <li style={{ margin: 0 }}>
                                    <a href="#" style={{
                                        display: 'block',
                                        padding: '12px 20px',
                                        color: '#ffffffff',
                                        textDecoration: 'none',
                                        borderLeft: '3px solid transparent'
                                    }}>
                                        📋 Reportes
                                    </a>
                                </li>
                                <li style={{ margin: 0 }}>
                                    <a href="#" style={{
                                        display: 'block',
                                        padding: '12px 20px',
                                        color: '#ffffffff',
                                        textDecoration: 'none',
                                        borderLeft: '3px solid transparent'
                                    }}>
                                        ⚙️ Configuración
                                    </a>
                                </li>
                            </ul>
                        </nav>

                    </aside>
                )}

                {/* Main Content */}
                <main style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
                    {/* Header Section */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '30px',
                        padding: '20px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ flex: 1 }}>
                            <h2 style={{
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                color: '#1e40af',
                                margin: '0 0 10px 0'
                            }}>
                                ¡Buen día, Administrador!
                            </h2>
                            <p style={{
                                fontSize: '1rem',
                                color: '#6b7280',
                                fontStyle: 'italic',
                                margin: 0
                            }}>
                                - Que tengas un excelente Lunes -
                            </p>
                        </div>
                        <div style={{ flex: 1, textAlign: 'right' }}>
                            <div style={{
                                backgroundColor: '#f3f4f6',
                                padding: '15px',
                                borderRadius: '8px',
                                display: 'inline-block'
                            }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#1f2937', fontSize: '1.1rem' }}>
                                    Admin del Sistema
                                </h4>
                                <p style={{ margin: '5px 0', color: '#6b7280', fontSize: '0.9rem' }}>
                                    Bicicletero UBB - Chillán, Chile
                                </p>
                                <p style={{ margin: '5px 0', color: '#6b7280', fontSize: '0.9rem' }}>
                                    Fecha: {new Date().toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px',
                        marginBottom: '30px'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            textAlign: 'center',
                            borderLeft: '4px solid #3b82f6'
                        }}>
                            <h3 style={{
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                color: '#1e40af',
                                margin: '0 0 10px 0'
                            }}>27</h3>
                            <p style={{
                                fontSize: '0.9rem',
                                color: '#6b7280',
                                margin: '0 0 10px 0'
                            }}>Bicicletas Registradas</p>
                            <span style={{
                                backgroundColor: '#eff6ff',
                                color: '#1e40af',
                                padding: '4px 8px',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>#Estacionamiento</span>
                        </div>

                        <div style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            textAlign: 'center',
                            borderLeft: '4px solid #10b981'
                        }}>
                            <h3 style={{
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                color: '#1e40af',
                                margin: '0 0 10px 0'
                            }}>15</h3>
                            <p style={{
                                fontSize: '0.9rem',
                                color: '#6b7280',
                                margin: '0 0 10px 0'
                            }}>Usuarios Activos</p>
                            <span style={{
                                backgroundColor: '#ecfdf5',
                                color: '#047857',
                                padding: '4px 8px',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>#Sistema</span>
                        </div>

                        <div style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            textAlign: 'center',
                            borderLeft: '4px solid #f59e0b'
                            }}>
                            <h3 style={{
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                color: '#1e40af',
                                margin: '0 0 10px 0'
                            }}>8</h3>
                            <p style={{
                                fontSize: '0.9rem',
                                color: '#6b7280',
                                margin: '0 0 10px 0'
                            }}>Guardias Activos</p>
                            <span style={{
                                backgroundColor: '#fffbeb',
                                color: '#b45309',
                                padding: '4px 8px',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>#Turnos</span>
                        </div>

                        <div style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            textAlign: 'center',
                            borderLeft: '4px solid #ef4444'
                        }}>
                            <h3 style={{
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                color: '#1e40af',
                                margin: '0 0 10px 0'
                            }}>3</h3>
                            <p style={{
                                fontSize: '0.9rem',
                                color: '#6b7280',
                                margin: '0 0 10px 0'
                            }}>Reportes Pendientes</p>
                            <span style={{
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                padding: '4px 8px',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>#Soporte</span>
                        </div>
                        
                    </div>

                
                    
                </main>
            </div>
        </div>
    );
}

export default HomeAdmin;