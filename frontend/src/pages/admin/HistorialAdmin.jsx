import { useState, useEffect, useCallback } from "react";
import LayoutAdmin from "../../components/admin/LayoutAdmin";
import { getToken } from '../../services/auth.service'; 
import HistoryService from '../../services/history.service';

function HistorialAdmin() {
  const [activeTab, setActiveTab] = useState("bicycles");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const styles = {
    container: { padding: "40px", backgroundColor: "#f4f7f6", minHeight: "90vh" },
    card: { backgroundColor: "white", borderRadius: "15px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", padding: "20px" },
    tabs: { display: "flex", gap: "15px", marginBottom: "30px", borderBottom: "2px solid #eee", paddingBottom: "15px" },
    tabBtn: (active) => ({
      padding: "12px 24px", border: "none", borderRadius: "8px", cursor: "pointer",
      backgroundColor: active ? "#3498db" : "#ecf0f1",
      color: active ? "white" : "#7f8c8d",
      fontWeight: "600", transition: "all 0.3s ease"
    }),
    table: { width: "100%", borderCollapse: "collapse", marginTop: "10px" },
    th: { textAlign: "left", padding: "15px", borderBottom: "2px solid #eee", color: "#2c3e50", fontSize: "14px" },
    td: { padding: "15px", borderBottom: "1px solid #eee", color: "#34495e", fontSize: "14px" },
    badge: (type) => {
      const t = type?.toLowerCase() || "";
      let backgroundColor = "#ecf0f1";
      let color = "#7f8c8d";
      
      if (t.includes("register") || t.includes("approve")) {
        backgroundColor = "#d4edda"; color = "#155724";
      } else if (t.includes("change") || t.includes("status")) {
        backgroundColor = "#fff3cd"; color = "#856404";
      }

      return {
        padding: "5px 12px", borderRadius: "20px", fontSize: "11px",
        textTransform: "uppercase", fontWeight: "bold", backgroundColor, color
      };
    }
  };

  const fetchData = useCallback(async (page = 1) => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const result = activeTab === "bicycles" 
        ? await HistoryService.getOccupancyHistory(page, 10)
        : await HistoryService.getGuardsHistory(page, 10);

     if (result && (result.success || result.status === "Success")) {
    // Si entramos aquí, es porque la API respondió bien
    const rawData = result.data?.data || result.data || [];
    setData(rawData);
    setPagination(result.data?.pagination || { page: 1, totalPages: 1 });
} else {
    // Solo lanzamos error si de verdad no hay datos ni status exitoso
    throw new Error(result?.message || "Error en el formato de respuesta");
}
      
    } catch (err) {
      console.error("❌ Error en Historial:", err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setData([]); 
    setLoading(true);
    setActiveTab(tab);
  };

  return (
    <LayoutAdmin>
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={{ color: "#2c3e50", marginBottom: "10px" }}>📋 Panel de Historial</h1>
          <p style={{ color: "#7f8c8d", marginBottom: "25px" }}>Registro de auditoría del sistema</p>

          <div style={styles.tabs}>
            <button style={styles.tabBtn(activeTab === "bicycles")} onClick={() => handleTabChange("bicycles")}>
              🚲 Movimientos
            </button>
            <button style={styles.tabBtn(activeTab === "users")} onClick={() => handleTabChange("users")}>
              👤 Usuarios
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px" }}>
              <p style={{ color: "#3498db", fontWeight: "bold" }}>🔄 Cargando datos del servidor...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: "#e74c3c" }}>⚠️ {error}</p>
              <button onClick={() => fetchData(1)} style={{ marginTop: "10px", cursor: "pointer" }}>Reintentar</button>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Fecha y Hora</th>
                  {activeTab === "bicycles" ? (
                    <>
                      <th style={styles.th}>Involucrado</th>
                      <th style={styles.th}>Tipo de Evento</th>
                      <th style={styles.th}>Descripción Detallada</th>
                    </>
                  ) : (
                    <>
                      <th style={styles.th}>Nombre Completo</th>
                      <th style={styles.th}>RUT</th>
                      <th style={styles.th}>Categoría</th>
                    </>
                  )}
                </tr>
              </thead>
             <tbody>
  {data.length > 0 ? (
    data.map((item, i) => (
      <tr key={item.id || i}>
        {/* FECHA: Maneja 'fecha' (nuevo JSON) o 'created_at' (JSON anterior) */}
        <td style={styles.td}>
          {item.fecha || item.created_at 
            ? new Date(item.fecha || item.created_at).toLocaleString() 
            : '---'}
        </td>

        {activeTab === "bicycles" ? (
          /* TABLA DE MOVIMIENTOS (JSON de Gestión) */
          <>
            <td style={styles.td}>
              {item.user ? `${item.user.names} ${item.user.lastName}` : "Sistema"}
            </td>
            <td style={styles.td}>
              <span style={styles.badge(item.type)}>
                {item.type?.replace(/_/g, ' ')}
              </span>
            </td>
            <td style={styles.td}>
              <div style={{ fontSize: '13px', color: '#555' }}>{item.description}</div>
            </td>
          </>
        ) : (
          /* TABLA DE USUARIOS (Nuevo JSON de Espacios) */
          <>
            <td style={styles.td}>
              {/* Usa 'usuario' del nuevo JSON o el objeto 'user' si existiera */}
              {item.usuario || (item.user ? `${item.user.names} ${item.user.lastName}` : "---")}
            </td>
            <td style={styles.td}>
              {/* Mostramos el lugar/bicicletero ya que el RUT no viene en este JSON */}
              {item.bicicletero || "---"} 
              <br/>
              <small style={{color: '#7f8c8d'}}>{item.lugar !== "N/A" ? item.lugar : ""}</small>
            </td>
            <td style={styles.td}>
              <span style={styles.badge(item.tipo || item.type)}>
                {item.tipo?.replace('user_', '') || item.type}
              </span>
              <div style={{ fontSize: '11px', marginTop: '5px', color: '#7f8c8d' }}>
                {item.detalles}
              </div>
            </td>
          </>
        )}
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#7f8c8d' }}>
        No se encontraron registros en esta categoría.
      </td>
    </tr>
  )}
</tbody>
            </table>
          )}
        </div>
      </div>
    </LayoutAdmin>
  );
}

export default HistorialAdmin;