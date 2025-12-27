"use strict";
import { useNavigate } from "react-router-dom";
import { logout } from "@services/auth.service.js";
import { useEffect } from "react";
import LayoutGuardia from "@components/guardia/LayoutGuardia";

function HomeGuardia() {
    const navigate = useNavigate();

    useEffect(() => {
        document.body.style.margin = "0";
        document.body.style.padding = "0";
        document.body.style.backgroundColor = "#272e4b";
        return () => {
            document.body.style.margin = "";
            document.body.style.padding = "";
            document.body.style.backgroundColor = "";
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/auth/login", { replace: true });
    };

    const goToMonitoring = () => navigate("/home/guardia/monitoring");
    const goToIncidentReports = () => navigate("/home/guardia/incident-reports");
    const goToPending = () => navigate("/home/guardia/pending-requests");
    const goToHistory = () => navigate("/home/reviews/history");
    const goToPerfil = () => navigate("/home/guardia/perfil");
    return (
        <LayoutGuardia>
            <div style={{ padding: "20px", fontFamily: "Arial", margin: 0 }}>

                {/* HEADER */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "30px",
                    padding: "25px",
                    backgroundColor: "#5a77df",
                    borderRadius: "15px",
                }}>
                    <div>
                        <h2 style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, color: "#fff" }}>
                            ¡Buen día, Guardia!
                        </h2>
                        <p style={{ fontSize: "1rem", opacity: 0.7, fontStyle: "italic", margin: 0 }}>
                            Have a safe shift today
                        </p>
                    </div>
                </div>

                {/* GRID ACTIONS */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "20px",
                }}>
                    <button onClick={goToMonitoring} style={btn("#3b82f6")}>🖥 Panel de Monitoreo</button>
                    <button onClick={goToIncidentReports} style={btn("#ef4444")}>⚠ Reportar Incidentes</button>
                    <button onClick={goToPending} style={btn("#f59e0b")}>📝 Solicitudes Pendientes</button>
                    <button onClick={goToHistory} style={btn("#10b981")}>📚 Historial de Solicitudes</button>
                    <button onClick={goToHistory} style={btn("#10b981")}>📚 Perfil</button>
                </div>

            </div>
        </LayoutGuardia>
    );
}

const btn = (color) => ({
    padding: "15px",
    backgroundColor: color,
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.2s ease",
});

export default HomeGuardia;
