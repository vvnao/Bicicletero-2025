"use strict";
import { useState } from "react";
import LayoutAdmin from "../../components/admin/LayoutAdmin";
import UserReviewHistory from "../UserReviewHistory";

import {
    Bike,
    Users,
    Shield,
    ClipboardList,
} from "lucide-react";

function HistorialAdmin() {
    const [activeHistory, setActiveHistory] = useState("bicicletas");

    const tabStyle = (key) => ({
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 20px",
        backgroundColor: activeHistory === key ? "#272e4b" : "#f3f4f6",
        color: activeHistory === key ? "white" : "#374151",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: 700,
        fontFamily: "Nunito",
    });

    const contentBox = {
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "12px",
        fontFamily: "Nunito",
    };

    const renderHistoryContent = () => {
        switch (activeHistory) {
            case "bicicletas":
                return (
                    <div style={contentBox}>
                        <h2>Historial de Bicicletas</h2>
                        <p>Ingresos y salidas por fecha, usuario o bicicleta.</p>
                    </div>
                );

            case "usuarios":
                return (
                    <div style={contentBox}>
                        <h2>Historial de Usuarios</h2>
                        <p>Solicitudes y cambios de estado.</p>
                    </div>
                );

            case "sistema":
                return (
                    <div style={contentBox}>
                        <h2>Historial de Guardias</h2>
                        <p>Asignación y gestión de guardias por bicicletero.</p>
                    </div>
                );

            case "requests":
                return (
                    <div style={contentBox}>
                        <UserReviewHistory />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <LayoutAdmin>
            <div style={{ padding: "20px" }}>
                {/* Tabs */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
                    <button style={tabStyle("bicicletas")} onClick={() => setActiveHistory("bicicletas")}>
                        <Bike size={18} /> Bicicletas
                    </button>

                    <button style={tabStyle("usuarios")} onClick={() => setActiveHistory("usuarios")}>
                        <Users size={18} /> Usuarios
                    </button>

                    <button style={tabStyle("sistema")} onClick={() => setActiveHistory("sistema")}>
                        <Shield size={18} /> Guardias
                    </button>

                    <button style={tabStyle("requests")} onClick={() => setActiveHistory("requests")}>
                        <ClipboardList size={18} /> Solicitudes
                    </button>
                </div>

                {renderHistoryContent()}
            </div>
        </LayoutAdmin>
    );
}

export default HistorialAdmin;
