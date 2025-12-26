import { useEffect, useState } from "react";
import { ReviewService } from "@services/review.service.js";
import { getBicyclesByUserId } from "../services/bicycles.service";
import { Inbox } from "lucide-react";
import "@styles/UserReviewHistory.css";

export default function UserReviewHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [bikes, setBikes] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [filter, setFilter] = useState("todos");

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const res = await ReviewService.getHistory();
            setHistory(res.data);
            setFiltered(res.data);
        } catch (err) {
            setError(err.message || "Error al cargar historial");
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = async (status) => {
        setFilter(status);
        if (status === "todos") {
            setFiltered(history);
            return;
        }
        try {
            const res = await ReviewService.filterHistory(status);
            setFiltered(res.data || []);
        } catch {
            setFiltered([]);
        }
    };

    const openUserModal = async (item) => {
        setSelectedUser(item);
        try {
            const res = await getBicyclesByUserId(item.user.id);
            setBikes(res.data || []);
            console.log("Bicicletas recibidas:", res.data);
        } catch {
            setBikes([]);
        }
    };

    const cleanPath = (p) =>
        p?.replace("src\\", "").replace(/\\/g, "/");

    if (loading)
        return <p className="user-review-loading">Cargando solicitudes...</p>;

    if (error)
        return <p className="user-review-error">⚠️ {error}</p>;

    if (history.length === 0) {
        return (
            <div className="user-review-empty">
                <Inbox size={48} />
                <h3>No hay solicitudes</h3>
                <p>No existen solicitudes pendientes ni revisadas.</p>
            </div>
        );
    }

    return (
        <div className="user-review-container">
            <h2 className="user-review-title">Solicitudes de Usuarios</h2>

            <div className="user-review-filter-bar">
                <button
                    className={filter === "aprobado" ? "filter-active" : ""}
                    onClick={() => applyFilter("aprobado")}
                >
                    Aprobado
                </button>

                <button
                    className={filter === "rechazado" ? "filter-active" : ""}
                    onClick={() => applyFilter("rechazado")}
                >
                    Rechazado
                </button>

                <button
                    className={filter === "todos" ? "filter-active" : ""}
                    onClick={() => applyFilter("todos")}
                >
                    Todos
                </button>
            </div>

            <table className="user-review-table">
                <thead>
                    <tr>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Revisado por</th>
                    </tr>
                </thead>

                <tbody>
                    {filtered.map((item) => (
                        <tr key={item.id}>
                            <td
                                className="user-review-clickable"
                                onClick={() => openUserModal(item)}
                            >
                                {item.user.names} {item.user.lastName}
                            </td>

                            <td>{item.user.email}</td>

                            <td
                                className={`user-review-status ${item.action === "aprobado"
                                    ? "status-aprobado"
                                    : "status-rechazado"
                                    }`}
                            >
                                {item.action === "aprobado" ? "Aprobado" : "Rechazado"}
                            </td>

                            <td>
                                {item.created_at
                                    ? new Date(item.created_at).toLocaleString()
                                    : "-"}
                            </td>

                            <td>
                                {item.guard
                                    ? `${item.guard.names} ${item.guard.lastName}`
                                    : "-"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedUser && (
                <div
                    className="user-modal-overlay"
                    onClick={() => {
                        setSelectedUser(null);
                        setPreviewImage(null);
                        setBikes([]);
                    }}
                >
                    <div className="user-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="user-modal-header">Información del Usuario</div>

                        <p>
                            <strong>Nombre:</strong> {selectedUser.user.names}{" "}
                            {selectedUser.user.lastName}
                        </p>
                        <p>
                            <strong>Email:</strong> {selectedUser.user.email}
                        </p>
                        <p>
                            <strong>RUT:</strong> {selectedUser.user.rut}
                        </p>
                        <p>
                            <strong>Tipo:</strong> {selectedUser.user.typePerson}
                        </p>

                        {selectedUser.user.tnePhoto && (
                            <>
                                <h4 className="user-modal-subtitle">TNE</h4>
                                <img
                                    src={`http://localhost:3000/${cleanPath(
                                        selectedUser.user.tnePhoto
                                    )}`}
                                    alt="TNE"
                                    className="user-modal-image"
                                    onClick={() =>
                                        setPreviewImage(
                                            `http://localhost:3000/${cleanPath(
                                                selectedUser.user.tnePhoto
                                            )}`
                                        )
                                    }
                                />
                            </>
                        )}

                        <h4 className="user-modal-subtitle">Bicicleta</h4>

                        {bikes.length > 0 ? (
                            <>
                                <p>
                                    <strong>Marca:</strong> {bikes[0].brand || "—"}
                                </p>
                                <p>
                                    <strong>Modelo:</strong> {bikes[0].model || "—"}
                                </p>
                                <p>
                                    <strong>Color:</strong> {bikes[0].color || "—"}
                                </p>

                                {bikes[0].photo && (
                                    <img
                                        src={`http://localhost:3000/${cleanPath(
                                            bikes[0].photo
                                        )}`}
                                        alt="Bicicleta"
                                        className="user-modal-image"
                                        onClick={() =>
                                            setPreviewImage(
                                                `http://localhost:3000/${cleanPath(
                                                    bikes[0].photo
                                                )}`
                                            )
                                        }
                                    />
                                )}
                            </>
                        ) : (
                            <div className="user-bike-empty">Bicicleta no ingresada 🚲</div>
                        )}

                        {previewImage && (
                            <div
                                className="image-preview-overlay"
                                onClick={() => setPreviewImage(null)}
                            >
                                <img src={previewImage} className="image-preview" />
                            </div>
                        )}

                        {selectedUser.action === "rechazado" && selectedUser.comment && (
                            <div className="user-reject-comment-box">
                                <strong>Motivo del rechazo:</strong>
                                <p className="user-reject-comment">{selectedUser.comment}</p>
                            </div>
                        )}

                        <button
                            className="user-modal-close-btn"
                            onClick={() => setSelectedUser(null)}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
