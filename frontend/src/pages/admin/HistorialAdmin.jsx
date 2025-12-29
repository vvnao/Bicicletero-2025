import { useState, useEffect, useCallback } from "react";
import LayoutAdmin from "../../components/admin/LayoutAdmin";
import UserReviewHistory from "../UserReviewHistory";
import { getToken } from '../../services/auth.service'; 
import HistoryService from '../../services/history.service';
import { 
  Bike,
  Users,
  Shield,
  ClipboardList,
  AlertTriangle 
} from "lucide-react";

function HistorialAdmin() {
  const [activeTab, setActiveTab] = useState("bicycles");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  
  // Verificar si hay token
  const token = getToken();

  const styles = {
    container: { 
      padding: "40px", 
      backgroundColor: "#f5f7fa", 
      minHeight: "90vh",
      fontFamily: "Nunito, sans-serif" 
    },
    card: { 
      backgroundColor: "white", 
      borderRadius: "15px", 
      boxShadow: "0 5px 20px rgba(0,0,0,0.08)", 
      padding: "30px",
      fontFamily: "Nunito, sans-serif"
    },
    tabs: { 
      display: "flex", 
      gap: "15px", 
      marginBottom: "30px", 
      paddingBottom: "15px",
      flexWrap: "wrap",
      borderBottom: "1px solid #eaeaea"
    },
    tabBtn: (active) => ({
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px 24px", 
      border: "none", 
      borderRadius: "8px", 
      cursor: "pointer",
      backgroundColor: active ? "#272e4b" : "#f3f4f6",
      color: active ? "white" : "#374151",
      fontWeight: "700", 
      transition: "all 0.3s ease",
      fontFamily: "Nunito, sans-serif",
      fontSize: "14px",
      boxShadow: active ? "0 4px 12px rgba(39, 46, 75, 0.2)" : "none"
    }),
    table: { 
      width: "100%", 
      borderCollapse: "separate", 
      borderSpacing: "0",
      marginTop: "20px",
      fontFamily: "Nunito, sans-serif",
      borderRadius: "10px",
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
    },
    th: { 
      textAlign: "left", 
      padding: "18px 15px", 
      backgroundColor: "#f8f9fa",
      color: "#2c3e50", 
      fontSize: "14px",
      fontWeight: "700",
      fontFamily: "Nunito, sans-serif",
      borderBottom: "2px solid #eaeaea"
    },
    td: { 
      padding: "16px 15px", 
      color: "#34495e", 
      fontSize: "14px",
      fontFamily: "Nunito, sans-serif",
      borderBottom: "1px solid #f0f0f0"
    },
    badge: (type) => {
      const t = type?.toLowerCase() || "";
      let backgroundColor = "#e8f4fd";
      let color = "#2c5282";
      
      if (t.includes("register") || t.includes("approve") || t.includes("crear") || t.includes("asignar")) {
        backgroundColor = "#d4f7e2";
        color = "#166534";
      } else if (t.includes("change") || t.includes("update") || t.includes("modificar")) {
        backgroundColor = "#fef3c7";
        color = "#92400e";
      } else if (t.includes("delete") || t.includes("remove") || t.includes("eliminar")) {
        backgroundColor = "#fee2e2";
        color = "#991b1b";
      } else if (t.includes("login") || t.includes("acceso")) {
        backgroundColor = "#e0e7ff";
        color = "#3730a3";
      }

      return {
        padding: "6px 14px", 
        borderRadius: "20px", 
        fontSize: "12px",
        textTransform: "capitalize", 
        fontWeight: "600", 
        backgroundColor, 
        color,
        fontFamily: "Nunito, sans-serif",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px"
      };
    },
    guardBadge: (status) => {
      const s = status?.toLowerCase() || "";
      let backgroundColor = "#e8f4fd";
      let color = "#2c5282";
      let text = status || "Activo";
      
      if (s.includes("activo") || s.includes("on") || s.includes("active")) {
        backgroundColor = "#d4f7e2";
        color = "#166534";
        text = "Activo";
      } else if (s.includes("inactivo") || s.includes("off") || s.includes("inactive")) {
        backgroundColor = "#fef3c7";
        color = "#92400e";
        text = "Inactivo";
      } else if (s.includes("ausente") || s.includes("absent")) {
        backgroundColor = "#fee2e2";
        color = "#991b1b";
        text = "Ausente";
      }

      return {
        padding: "6px 14px", 
        borderRadius: "20px", 
        fontSize: "12px",
        fontWeight: "600", 
        backgroundColor, 
        color,
        fontFamily: "Nunito, sans-serif"
      };
    }
  };

  const fetchData = useCallback(async (page = 1) => {
    if (!token) {
      setError("No hay token de autenticación. Por favor, inicie sesión.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;
      
      switch(activeTab) {
        case "bicycles":
          result = await HistoryService.getOccupancyHistory(page, 10);
          break;
        case "users":
          // Verificar si existe getManagementMovements, si no usar otro método
          if (HistoryService.getManagementMovements) {
            result = await HistoryService.getManagementMovements(page, 10);
          } else {
            // Intentar con otro método o ruta alternativa
            console.warn("getManagementMovements no disponible, usando getGuardsHistory como fallback");
            result = await HistoryService.getGuardsHistory(page, 10);
          }
          break;
        case "sistema":
          result = await HistoryService.getGuardsHistory(page, 10);
          break;
        default:
          result = null;
      }

      console.log(`📊 Resultado para ${activeTab}:`, result);

      if (result) {
        // Manejar diferentes formatos de respuesta
        if (result.success || result.status === "Success" || result.status === 200) {
          const rawData = result.data?.data || result.data || [];
          setData(rawData);
          setPagination(result.data?.pagination || { page, totalPages: 1 });
        } else {
          // Si la respuesta no tiene success/status pero tiene data
          if (Array.isArray(result.data)) {
            setData(result.data);
          } else if (Array.isArray(result)) {
            setData(result);
          } else {
            throw new Error(result?.message || "Formato de respuesta no reconocido");
          }
        }
      } else {
        throw new Error("Respuesta vacía del servidor");
      }
    } catch (err) {
      console.error(`❌ Error en Historial (${activeTab}):`, err);
      
      let errorMessage = "No se pudo conectar con el servidor.";
      
      if (err.message.includes("getManagementMovements no disponible")) {
        errorMessage = "El servicio para historial de usuarios no está disponible.";
      } else if (err.response) {
        errorMessage = `Error ${err.response.status}: ${err.response.data?.message || "Error del servidor"}`;
      } else if (err.request) {
        errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión.";
      } else {
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, token]);

  useEffect(() => {
    if (activeTab !== "requests") {
      fetchData(1);
    }
  }, [activeTab, fetchData]);

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setData([]);
    setError(null);
    setLoading(true);
    setActiveTab(tab);
  };

  // Función para debugging
  useEffect(() => {
    console.log("📋 Métodos disponibles en HistoryService:", Object.keys(HistoryService));
  }, []);

  // Renderizar tabla de bicicletas 
const renderBicyclesTable = () => (
  <table style={styles.table}>
    <thead>
      <tr>
        <th style={styles.th}>Fecha</th>
        <th style={styles.th}>Usuario</th>
        <th style={styles.th}>Bicicleta</th>
        <th style={styles.th}>Bicicletero</th>
        <th style={styles.th}>Acción</th>
        <th style={styles.th}>Detalles</th>
      </tr>
    </thead>
    <tbody>
      {data.map((item, i) => {
        const userName = item.user ? `${item.user.names || ''} ${item.user.lastName || ''}`.trim() : "Sistema";
        const userEmail = item.user?.email || null;
        const userRut = item.user?.rut || null;
        
        const bikeBrand = item.bicycle?.brand || item.marca || "---";
        const bikeColor = item.bicycle?.color || item.color || "---";
        const bikeModel = item.bicycle?.model || item.modelo || "---";
        
        const bikerackName = item.bikerack?.name || item.bicicletero || "---";
        const bikerackLocation = item.bikerack?.location || item.ubicacion || null;
        
        const action = item.type || item.accion || "---";
        const details = item.description || item.detalles || "Sin detalles";
        
        return (
          <tr key={item.id || i} style={{
            backgroundColor: i % 2 === 0 ? "#ffffff" : "#fafbfc"
          }}>
            <td style={styles.td}>
              {item.fecha || item.created_at
                ? new Date(item.fecha || item.created_at).toLocaleString('es-CL', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) 
                : '---'}
            </td>
            <td style={styles.td}>
              <div style={{ fontWeight: "600", color: "#1e40af" }}>
                {userName}
              </div>
              {userEmail && (
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  ✉️ {userEmail}
                </div>
              )}
              {userRut && (
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  📋 {userRut}
                </div>
              )}
            </td>
            <td style={styles.td}>
              <div style={{ fontWeight: "600" }}>
                {bikeBrand} {bikeModel}
              </div>
              {bikeColor && (
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                   {bikeColor}
                </div>
              )}
            </td>
            <td style={styles.td}>
              <div style={{ fontWeight: "600" }}>
                {bikerackName}
              </div>
              {bikerackLocation && (
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                   {bikerackLocation}
                </div>
              )}
            </td>
            <td style={styles.td}>
              <span style={styles.badge(action)}>
                {action?.replace(/_/g, ' ')}
              </span>
            </td>
            <td style={styles.td}>
              <div style={{ fontSize: '13px', color: '#4b5563' }}>
                {details}
              </div>
              {item.slot && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6b7280',
                  marginTop: '4px',
                  backgroundColor: "#f3f4f6",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  display: "inline-block"
                }}>
                  🅿️ Espacio: {item.slot}
                </div>
              )}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);
  // Renderizar tabla de usuarios - VERSIÓN CORREGIDA
const renderUsersTable = () => (
  <table style={styles.table}>
    <thead>
      <tr>
        <th style={styles.th}>Fecha</th>
        <th style={styles.th}>Usuario</th>
        <th style={styles.th}>Tipo de Usuario</th>
        <th style={styles.th}>Acción</th>
        <th style={styles.th}>Detalles</th>
      </tr>
    </thead>
    <tbody>
      {data.map((item, i) => {
        // Extraer información del usuario de diferentes formatos posibles
        const userName = item.usuario || 
                       (item.user ? `${item.user.names || ''} ${item.user.lastName || ''}`.trim() : "Sistema") ||
                       item.nombre || 
                       "---";
        
        const userType = item.userType || 
                        item.user?.typePerson || 
                        item.user?.type || 
                        item.tipoUsuario || 
                        item.tipo || 
                        "---";
        
        const action = item.accion || 
                      item.action || 
                      item.type || 
                      item.operation || 
                      "---";
        
        const details = item.detalles || 
                       item.description || 
                       item.details || 
                       item.comment ||
                       "Sin detalles adicionales";
        
        return (
          <tr key={item.id || i} style={{
            backgroundColor: i % 2 === 0 ? "#ffffff" : "#fafbfc"
          }}>
            <td style={styles.td}>
              {item.fecha || item.created_at || item.date || item.timestamp
                ? new Date(item.fecha || item.created_at || item.date || item.timestamp).toLocaleString('es-CL', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) 
                : '---'}
            </td>
            <td style={styles.td}>
              <div style={{ fontWeight: "600", color: "#1e40af" }}>
                {userName}
              </div>
              {item.user?.email && (
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  ✉️ {item.user.email}
                </div>
              )}
              {item.user?.rut && (
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  📋 {item.user.rut}
                </div>
              )}
            </td>
            <td style={styles.td}>
              <div style={{ 
                fontWeight: "600",
                color: userType === "funcionario" ? "#1e40af" : 
                       userType === "estudiante" ? "#166534" : 
                       userType === "externo" ? "#92400e" : "#374151"
              }}>
                {userType}
              </div>
            </td>
            <td style={styles.td}>
              <span style={styles.badge(action)}>
                {action}
              </span>
            </td>
            <td style={styles.td}>
              <div style={{ fontSize: '13px', color: '#4b5563' }}>
                {details}
              </div>
              {item.changes && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6b7280',
                  marginTop: '4px',
                  backgroundColor: "#f3f4f6",
                  padding: "4px 8px",
                  borderRadius: "4px"
                }}>
                  📝 {item.changes}
                </div>
              )}
              {item.reason && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6b7280',
                  marginTop: '4px',
                  backgroundColor: "#fef3c7",
                  padding: "4px 8px",
                  borderRadius: "4px"
                }}>
                  📋 Motivo: {item.reason}
                </div>
              )}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

  // Renderizar tabla de guardias - VERSIÓN CORREGIDA
const renderGuardsTable = () => (
  <table style={styles.table}>
    <thead>
      <tr>
        <th style={styles.th}>Fecha</th>
        <th style={styles.th}>Guardia</th>
        <th style={styles.th}>Contacto</th>
        <th style={styles.th}>Bicicletero</th>
        <th style={styles.th}>Estado</th>
        <th style={styles.th}>Acción</th>
        <th style={styles.th}>Detalles</th>
      </tr>
    </thead>
    <tbody>
      {data.map((item, i) => {
        // Extraer información del guardia de diferentes formatos posibles
        const guardName = item.guard?.names || 
                         item.guard?.name || 
                         item.nombreGuardia || 
                         item.guardName || 
                         item.user?.names || 
                         "---";
        
        const guardLastName = item.guard?.lastName || 
                            item.guard?.last_name || 
                            item.apellidoGuardia || 
                            item.user?.lastName || 
                            "";
        
        const guardEmail = item.guard?.email || 
                          item.email || 
                          item.user?.email || 
                          null;
        
        const guardPhone = item.guard?.phone || 
                          item.phone || 
                          item.telefono || 
                          item.user?.phone || 
                          null;
        
        const guardRut = item.guard?.rut || 
                        item.rut || 
                        item.user?.rut || 
                        null;
        
        const bikerackName = item.bikerack?.name || 
                            item.bicicletero || 
                            item.bikerackName || 
                            "---";
        
        const bikerackLocation = item.bikerack?.location || 
                                item.ubicacion || 
                                item.location || 
                                null;
        
        const status = item.estado || 
                      item.status || 
                      item.guard?.status || 
                      "---";
        
        const action = item.accion || 
                      item.action || 
                      item.type || 
                      "---";
        
        const details = item.detalles || 
                       item.description || 
                       item.details || 
                       "Sin detalles adicionales";
        
        return (
          <tr key={item.id || i} style={{
            backgroundColor: i % 2 === 0 ? "#ffffff" : "#fafbfc"
          }}>
            <td style={styles.td}>
              {item.fecha || item.created_at || item.date
                ? new Date(item.fecha || item.created_at || item.date).toLocaleString('es-CL', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) 
                : '---'}
            </td>
            <td style={styles.td}>
              <div style={{ fontWeight: "600", color: "#1e40af" }}>
                {guardName} {guardLastName}
              </div>
              {guardRut && (
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  📋 {guardRut}
                </div>
              )}
            </td>
            <td style={styles.td}>
              {guardEmail && (
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                  ✉️ {guardEmail}
                </div>
              )}
              {guardPhone && (
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  📞 {guardPhone}
                </div>
              )}
            </td>
            <td style={styles.td}>
              <div style={{ fontWeight: "600" }}>
                {bikerackName}
              </div>
              {bikerackLocation && (
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  📍 {bikerackLocation}
                </div>
              )}
            </td>
            <td style={styles.td}>
              <span style={styles.guardBadge(status)}>
                {status}
              </span>
            </td>
            <td style={styles.td}>
              <span style={styles.badge(action)}>
                {action}
              </span>
            </td>
            <td style={styles.td}>
              <div style={{ fontSize: '13px', color: '#4b5563' }}>
                {details}
              </div>
              {item.horario && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6b7280',
                  marginTop: '4px',
                  backgroundColor: "#f3f4f6",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  display: "inline-block",
                  marginRight: "8px"
                }}>
                  🕒 {item.horario}
                </div>
              )}
              {item.turno && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6b7280',
                  marginTop: '4px',
                  backgroundColor: "#e0e7ff",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  display: "inline-block"
                }}>
                  🔄 Turno: {item.turno}
                </div>
              )}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;
    
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
        marginTop: "30px",
        fontFamily: "Nunito, sans-serif"
      }}>
        <button
          onClick={() => fetchData(pagination.page - 1)}
          disabled={pagination.page <= 1}
          style={{
            padding: "8px 16px",
            backgroundColor: pagination.page <= 1 ? "#f3f4f6" : "#272e4b",
            color: pagination.page <= 1 ? "#9ca3af" : "white",
            border: "none",
            borderRadius: "6px",
            cursor: pagination.page <= 1 ? "not-allowed" : "pointer",
            fontWeight: "600",
            fontFamily: "Nunito, sans-serif"
          }}
        >
          ← Anterior
        </button>
        
        <span style={{ color: "#6b7280", fontWeight: "600" }}>
          Página {pagination.page} de {pagination.totalPages}
        </span>
        
        <button
          onClick={() => fetchData(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
          style={{
            padding: "8px 16px",
            backgroundColor: pagination.page >= pagination.totalPages ? "#f3f4f6" : "#272e4b",
            color: pagination.page >= pagination.totalPages ? "#9ca3af" : "white",
            border: "none",
            borderRadius: "6px",
            cursor: pagination.page >= pagination.totalPages ? "not-allowed" : "pointer",
            fontWeight: "600",
            fontFamily: "Nunito, sans-serif"
          }}
        >
          Siguiente →
        </button>
      </div>
    );
  };

  const renderContent = () => {
    // Si es la pestaña de solicitudes, usar el componente separado
    if (activeTab === "requests") {
      return <UserReviewHistory />;
    }

    // Para las otras pestañas
    return (
      <>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <div style={{
              display: "inline-block",
              width: "50px",
              height: "50px",
              border: "3px solid #f3f3f3",
              borderTop: "3px solid #272e4b",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "20px"
            }} />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <p style={{ color: "#4b5563", fontWeight: "600", fontFamily: "Nunito, sans-serif" }}>
              Cargando historial de {activeTab === "bicycles" ? "bicicletas" : activeTab === "users" ? "usuarios" : "guardias"}...
            </p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <AlertTriangle size={48} style={{ color: "#ef4444", marginBottom: "15px" }} />
            <h3 style={{ color: "#1f2937", marginBottom: "10px", fontFamily: "Nunito, sans-serif", fontWeight: "700" }}>
              Error al cargar datos
            </h3>
            <p style={{ color: "#6b7280", marginBottom: "20px", fontFamily: "Nunito, sans-serif" }}>
              {error}
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => fetchData(1)}
                style={{ 
                  cursor: "pointer",
                  padding: "10px 24px",
                  backgroundColor: "#272e4b",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: "600",
                  fontSize: "14px"
                }}
              >
                Reintentar
              </button>
              <button
                onClick={() => console.log("Debug info:", { activeTab, data, error })}
                style={{ 
                  cursor: "pointer",
                  padding: "10px 24px",
                  backgroundColor: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: "600",
                  fontSize: "14px"
                }}
              >
                Debug Info
              </button>
            </div>
          </div>
        ) : data.length > 0 ? (
          <>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              padding: "15px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              borderLeft: "4px solid #272e4b"
            }}>
              <div>
                <h3 style={{
                  color: "#1e293b",
                  margin: 0,
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: "700",
                  fontSize: "18px"
                }}>
                  {activeTab === "bicycles" && "📊 Historial de Bicicletas"}
                  {activeTab === "users" && "👥 Historial de Usuarios"}
                  {activeTab === "sistema" && "🛡️ Historial de Guardias"}
                </h3>
                <p style={{
                  color: "#64748b",
                  margin: "5px 0 0 0",
                  fontFamily: "Nunito, sans-serif",
                  fontSize: "14px"
                }}>
                  {activeTab === "bicycles" && "Movimientos de ingreso y salida de bicicletas"}
                  {activeTab === "users" && "Solicitudes y cambios de estado de usuarios"}
                  {activeTab === "sistema" && "Asignación y gestión de guardias por bicicletero"}
                </p>
              </div>
              <div style={{
                backgroundColor: "#272e4b",
                color: "white",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                fontFamily: "Nunito, sans-serif"
              }}>
                Total: {data.length} registros
              </div>
            </div>

            {activeTab === "bicycles" && renderBicyclesTable()}
            {activeTab === "users" && renderUsersTable()}
            {activeTab === "sistema" && renderGuardsTable()}
            
            {renderPagination()}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <div style={{
              width: "80px",
              height: "80px",
              backgroundColor: "#f3f4f6",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "32px"
            }}>
              {activeTab === "bicycles" && "🚲"}
              {activeTab === "users" && "👤"}
              {activeTab === "sistema" && "🛡️"}
            </div>
            <h3 style={{ color: "#374151", marginBottom: "10px", fontFamily: "Nunito, sans-serif", fontWeight: "700" }}>
              No hay registros
            </h3>
            <p style={{ color: "#9ca3af", fontFamily: "Nunito, sans-serif" }}>
              {activeTab === "bicycles" && "No se encontraron movimientos de bicicletas."}
              {activeTab === "users" && "No se encontraron cambios en usuarios."}
              {activeTab === "sistema" && "No se encontraron movimientos de guardias."}
            </p>
          </div>
        )}
      </>
    );
  };

  return (
    <LayoutAdmin>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ marginBottom: "30px" }}>
            <h1 style={{ 
              color: "#1e293b", 
              marginBottom: "8px",
              fontFamily: "Nunito, sans-serif",
              fontWeight: "800",
              fontSize: "28px"
            }}>
              📋 Panel de Historial
            </h1>
            <p style={{ 
              color: "#64748b", 
              margin: 0,
              fontFamily: "Nunito, sans-serif",
              fontSize: "16px"
            }}>
              Registro de auditoría del sistema
            </p>
          </div>

          <div style={styles.tabs}>
            <button 
              style={styles.tabBtn(activeTab === "bicycles")} 
              onClick={() => handleTabChange("bicycles")}
            >
              <Bike size={20} /> Bicicletas
            </button>
            <button 
              style={styles.tabBtn(activeTab === "users")} 
              onClick={() => handleTabChange("users")}
            >
              <Users size={20} /> Usuarios
            </button>
            <button 
              style={styles.tabBtn(activeTab === "sistema")} 
              onClick={() => handleTabChange("sistema")}
            >
              <Shield size={20} /> Guardias
            </button>
            <button
              style={styles.tabBtn(activeTab === "requests")}
              onClick={() => handleTabChange("requests")}
            >
              <ClipboardList size={20} /> Solicitudes
            </button>
          </div>

          {/* CONTENIDO PRINCIPAL */}
          {renderContent()}
        </div>
      </div>
    </LayoutAdmin>
  );
}

export default HistorialAdmin;