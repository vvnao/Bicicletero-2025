// src/components/guardia/GuardiaReviewWrapper.jsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function GuardiaReviewWrapper({ children }) {
    const navigate = useNavigate();

    return (
        <div style={{
            padding: "20px",
            fontFamily: "'Nunito', sans-serif",
        }}>
            {/* Botón de regreso (opcional) */}
            <button
                onClick={() => navigate("/home/guardia")}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "15px",
                    padding: "8px 16px",
                    backgroundColor: "transparent",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    color: "#475569",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 600,
                    transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                    e.currentTarget.style.borderColor = "#cbd5e1";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                }}
            >
                <ArrowLeft size={16} />
                Volver al Dashboard
            </button>

            {/* Contenedor principal */}
            <div style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "25px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            }}>
                {/* Encabezado */}
                <div style={{
                    marginBottom: "25px",
                }}>
                    <h1 style={{
                        margin: 0,
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "#1e293b",
                        fontFamily: "'Poppins', sans-serif",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                    }}>
                        <span style={{
                            backgroundColor: "#272e4b",
                            color: "white",
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                            📋
                        </span>
                        Historial de Solicitudes
                    </h1>
                    <p style={{
                        margin: "8px 0 0 46px",
                        color: "#64748b",
                        fontSize: "0.95rem"
                    }}>
                        Visualiza todas las solicitudes de registro procesadas por el sistema
                    </p>
                </div>

                {/* Contenido (UserReviewHistory) */}
                <div style={{ marginTop: "20px" }}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default GuardiaReviewWrapper;