"use strict";
import { useState, useEffect } from "react";
import LayoutAdmin from "../../components/admin/LayoutAdmin";
import HistoryService from "../../services/history.service";

function HistorialAdmin() {
  const [activeTab, setActiveTab] = useState("bicycles");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: ""
  });

  const cargarHistorial = async () => {
    setLoading(true);
    setError(null);
    setData([]);

    try {
      let response;

      if (activeTab === "bicycles") {
        response = await HistoryService.getAllBicycleHistory(filters);
      } else if (activeTab === "users") {
        response = await HistoryService.getAllUserHistory(filters);
      } else if (activeTab === "guards") {
        response = await HistoryService.getAllGuardHistory(filters);
      }

      console.log("📦 Response completa:", response);

      /**
       * ESTRUCTURA REAL:
       * response = {
       *   success,
       *   message,
       *   data: {
       *     data: [],
       *     pagination: {}
       *   }
       * }
       */

      if (response?.data?.data && Array.isArray(response.data.data)) {
        setData(response.data.data);
        setPagination(response.data.pagination || null);
      } else {
        setData([]);
        setPagination(null);
      }

    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.message || "Error al cargar historial");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [activeTab, filters.page]);

  return (
    <LayoutAdmin>
      <div style={{ padding: 20 }}>
        <h1>📋 Historial del Sistema</h1>

        {/* TABS */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <button onClick={() => setActiveTab("bicycles")}>🚲 Bicicletas</button>
          <button onClick={() => setActiveTab("users")}>👤 Usuarios</button>
          <button onClick={() => setActiveTab("guards")}>🛡️ Guardias</button>
          <button onClick={cargarHistorial}>🔄 Actualizar</button>
        </div>

        {/* ESTADOS */}
        {loading && <p>⏳ Cargando...</p>}
        {error && <p style={{ color: "red" }}>❌ {error}</p>}

        {!loading && !error && (
          <>
            <h3>Registros encontrados: {data.length}</h3>

            {data.length === 0 ? (
              <p>No hay registros</p>
            ) : (
              <div style={{ maxHeight: "500px", overflow: "auto" }}>
                {data.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      border: "1px solid #ddd",
                      marginBottom: 10,
                      padding: 10,
                      borderRadius: 5,
                      background: index % 2 === 0 ? "#f9f9f9" : "#fff"
                    }}
                  >
                    <pre style={{ margin: 0, fontSize: 12 }}>
                      {JSON.stringify(item, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}

            {/* PAGINACIÓN */}
            {pagination && (
              <div style={{ marginTop: 20 }}>
                <button
                  disabled={filters.page <= 1}
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page - 1 })
                  }
                >
                  ⬅️ Anterior
                </button>

                <span style={{ margin: "0 10px" }}>
                  Página {pagination.page} de {pagination.totalPages}
                </span>

                <button
                  disabled={filters.page >= pagination.totalPages}
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page + 1 })
                  }
                >
                  Siguiente ➡️
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </LayoutAdmin>
  );
}

export default HistorialAdmin;
