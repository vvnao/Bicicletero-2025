"use strict";
import { useState } from 'react';
import LayoutAdmin from "../../components/admin/LayoutAdmin";

function HistorialAdmin() {
    const [activeHistory, setActiveHistory] = useState('bicicletas');

    const renderHistoryContent = () => {
        switch(activeHistory) {
            case 'bicicletas':
                return (
                    <div style={{padding: '20px', backgroundColor: 'white', borderRadius: '10px'}}>
                        <h2>Historial de Bicicletas</h2>
                        <p>Consultar un historial de ingresos y salidas por fecha, usuario o bicicleta.</p>
                        {/* tabla/listado del historial de bicicletas (me falta)*/}
                    </div>
                );
            case 'usuarios':
                return (
                    <div style={{padding: '20px', backgroundColor: 'white', borderRadius: '10px'}}>
                        <h2>Historial de Usuarios</h2>
                        <p>Registro de solicitudes de registro y cambios de estado</p>
                        {/* la tabla/listado del historial de usuarios (me falta) */}
                    </div>
                );
            case 'sistema':
                return (
                    <div style={{padding: '20px', backgroundColor: 'white', borderRadius: '10px'}}>
                        <h2>Historial de los guardias</h2>
                        <p>Podrá asignar guardias a cada bicicletero según corresponda. Esta funcionalidad estará disponible en una sección donde el administrador podrá visualizar<br/>
                            los bicicleteros registrados y seleccionar los guardias encargados de cada uno. El administrador podrá modificar o actualizar las asignaciones cuando sea necesario.</p>
                        {/* la tabla/listado del historial de los guardias(me falta) */}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <LayoutAdmin>
            <div style={{padding: '20px'}}>
                {/* Pestañas de navegación */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '20px',
                    flexWrap: 'wrap'
                }}>
                    <button
                        style={{
                            padding: '10px 20px',
                            backgroundColor: activeHistory === 'bicicletas' ? '#272e4b' : '#f3f4f6',
                            color: activeHistory === 'bicicletas' ? 'white' : '#374151',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                        onClick={() => setActiveHistory('bicicletas')}
                    >
                        🚲 Bicicletas
                    </button>
                    
                    <button
                        style={{
                            padding: '10px 20px',
                            backgroundColor: activeHistory === 'usuarios' ? '#272e4b' : '#f3f4f6',
                            color: activeHistory === 'usuarios' ? 'white' : '#374151',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                        onClick={() => setActiveHistory('usuarios')}
                    >
                        👥 Usuarios
                    </button>
                    
                    <button
                        style={{
                            padding: '10px 20px',
                            backgroundColor: activeHistory === 'sistema' ? '#272e4b' : '#f3f4f6',
                            color: activeHistory === 'sistema' ? 'white' : '#374151',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                        onClick={() => setActiveHistory('sistema')}
                    >
                        🛡️ Guardias
                    </button>
                </div>
                
                {/* Contenido del historial */}
                {renderHistoryContent()}
            </div>
        </LayoutAdmin>
    );
}

export default HistorialAdmin;