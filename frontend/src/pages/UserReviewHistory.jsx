import { useEffect, useState } from "react";
import { ReviewService } from "@services/review.service.js";
import { getBicyclesByUserId } from "../services/bicycles.service";
import { Inbox, Trash2, Edit, Check, X, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
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
    const [editing, setEditing] = useState(null);
    const [editData, setEditData] = useState({ action: "", comment: "" });
    const [processing, setProcessing] = useState(false);

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
        } catch {
            setBikes([]);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar este registro del historial?")) return;

        try {
            setProcessing(true);
            await ReviewService.deleteReview(id);
            await loadHistory();
            alert("Registro eliminado exitosamente");
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleEdit = (item) => {
        setEditing(item.id);
        setEditData({
            action: item.action,
            comment: item.comment || ""
        });
    };

    const handleSaveEdit = async (id) => {
        if (!editData.action) {
            alert("Debe seleccionar un estado");
            return;
        }

        const dataToSend = {
            action: editData.action,
            comment: editData.action === "rechazado" ? editData.comment : ""
        };

        try {
            setProcessing(true);
            await ReviewService.updateStatus(id, dataToSend.action, dataToSend.comment);
            await loadHistory();
            setEditing(null);
            setEditData({ action: "", comment: "" });
            alert("Estado actualizado exitosamente");
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleCancelEdit = () => {
        setEditing(null);
        setEditData({ action: "", comment: "" });
    };

    const handleActionChange = (action) => {
        const newComment = action === "aprobado" ? "" : editData.comment;
        setEditData({
            action,
            comment: newComment
        });
    };

    const cleanPath = (p) => p?.replace("src\\", "").replace(/\\/g, "/");

    if (loading)
        return <p className="user-review-loading">Cargando solicitudes...</p>;

    if (error) {
        return (
            <div className="user-review-error-container">
                <AlertTriangle size={48} className="user-review-error-icon" />
                <h3>Error al cargar historial</h3>
                <p className="user-review-error-message">{error}</p>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="user-review-empty">
                <Inbox size={48} />
                <h3>No hay solicitudes</h3>
                <p>No existen solicitudes revisadas.</p>
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
                        <th>Acciones</th>
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

                            <td>
                                {editing === item.id ? (
                                    <select
                                        value={editData.action}
                                        onChange={(e) => setEditData({ ...editData, action: e.target.value })}
                                        className="user-review-select"
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="aprobado">Aprobado</option>
                                        <option value="rechazado">Rechazado</option>
                                    </select>
                                ) : (
                                    <span className={`user-review-status ${item.action === "aprobado"
                                        ? "status-aprobado"
                                        : "status-rechazado"
                                        }`}
                                    >
                                        {item.action === "aprobado" ? "Aprobado" : "Rechazado"}
                                    </span>
                                )}
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

                            <td>
                                {editing === item.id ? (
                                    <div className="user-review-actions">
                                        <button
                                            onClick={() => handleSaveEdit(item.id)}
                                            disabled={processing}
                                            className="user-review-btn user-review-btn-save"
                                        >
                                            <Check size={14} />
                                            Guardar
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            disabled={processing}
                                            className="user-review-btn user-review-btn-cancel"
                                        >
                                            <X size={14} />
                                            Cancelar
                                        </button>
                                    </div>
                                ) : (
                                    <div className="user-review-actions">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="user-review-btn user-review-btn-edit"
                                            title="Modificar estado"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            disabled={processing}
                                            className="user-review-btn user-review-btn-delete"
                                            title="Eliminar registro"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
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

                        <div className="user-modal-content">
                            <div className="user-modal-info-group">
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

                                {selectedUser.user.typePerson === "funcionario" && (
                                    <>
                                        <p>
                                            <strong>Cargo:</strong> {selectedUser.user.position || "No especificado"}
                                        </p>
                                        <p>
                                            <strong>Descripción del cargo:</strong> {selectedUser.user.positionDescription || "No especificada"}
                                        </p>
                                    </>
                                )}
                            </div>

                            {selectedUser.user.tnePhoto && (
                                <>
                                    <h4 className="user-modal-subtitle">TNE</h4>
                                    <div
                                        className="user-modal-image-container"
                                        onClick={() =>
                                            setPreviewImage(
                                                `http://localhost:3000/${cleanPath(
                                                    selectedUser.user.tnePhoto
                                                )}`
                                            )
                                        }
                                    >
                                        <img
                                            src={`http://localhost:3000/${cleanPath(
                                                selectedUser.user.tnePhoto
                                            )}`}
                                            alt="TNE"
                                            className="user-modal-image"
                                        />
                                        <div className="user-modal-image-overlay">
                                            <span className="user-modal-image-text">Click para ampliar</span>
                                        </div>
                                    </div>
                                </>
                            )}

                            <h4 className="user-modal-subtitle">Bicicleta</h4>

                            {bikes.length > 0 ? (
                                <>
                                    <div className="user-modal-info-group">
                                        <p>
                                            <strong>Marca:</strong> {bikes[0].brand || "—"}
                                        </p>
                                        <p>
                                            <strong>Modelo:</strong> {bikes[0].model || "—"}
                                        </p>
                                        <p>
                                            <strong>Color:</strong> {bikes[0].color || "—"}
                                        </p>
                                    </div>

                                    {bikes[0].photo && (
                                        <div
                                            className="user-modal-image-container"
                                            onClick={() =>
                                                setPreviewImage(
                                                    `http://localhost:3000/${cleanPath(
                                                        bikes[0].photo
                                                    )}`
                                                )
                                            }
                                        >
                                            <img
                                                src={`http://localhost:3000/${cleanPath(
                                                    bikes[0].photo
                                                )}`}
                                                alt="Bicicleta"
                                                className="user-modal-image"
                                            />
                                            <div className="user-modal-image-overlay">
                                                <span className="user-modal-image-text">Click para ampliar</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="user-bike-empty">Bicicleta no ingresada 🚲</div>
                            )}

                            {selectedUser.action === "rechazado" && selectedUser.comment && (
                                <div className="user-reject-comment-box">
                                    <strong>Motivo del rechazo:</strong>
                                    <p className="user-reject-comment">{selectedUser.comment}</p>
                                </div>
                            )}

                            <div className="user-modal-actions">
                                <button
                                    onClick={() => {
                                        setSelectedUser(null);
                                        handleEdit(selectedUser);
                                    }}
                                    className="user-modal-action-btn user-modal-action-edit"
                                >
                                    <Edit size={16} />
                                    Modificar Estado
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedUser(null);
                                        if (window.confirm("¿Eliminar este registro del historial?")) {
                                            handleDelete(selectedUser.id);
                                        }
                                    }}
                                    className="user-modal-action-btn user-modal-action-delete"
                                >
                                    <Trash2 size={16} />
                                    Eliminar
                                </button>
                            </div>

                            <button
                                className="user-modal-close-btn"
                                onClick={() => setSelectedUser(null)}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {previewImage && (
                <div
                    className="image-preview-overlay"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="image-preview-container" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="image-preview"
                        />
                        <button
                            className="image-preview-close"
                            onClick={() => setPreviewImage(null)}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {editing && !selectedUser && (
                <div className="user-modal-overlay" onClick={handleCancelEdit}>
                    <div className="user-modal edit-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="user-modal-header">Modificar Estado</div>

                        <div style={{ marginBottom: "15px" }}>
                            <label className="edit-modal-label">
                                Nuevo estado:
                            </label>
                            <select
                                value={editData.action}
                                onChange={(e) => handleActionChange(e.target.value)}
                                className="edit-modal-select"
                            >
                                <option value="">Seleccionar estado</option>
                                <option value="aprobado">Aprobado</option>
                                <option value="rechazado">Rechazado</option>
                            </select>
                        </div>

                        {editData.action === "rechazado" && (
                            <div style={{ marginBottom: "20px" }}>
                                <label className="edit-modal-label">
                                    Motivo del rechazo:
                                </label>
                                <textarea
                                    value={editData.comment}
                                    onChange={(e) => setEditData({ ...editData, comment: e.target.value })}
                                    placeholder="Ingrese motivo del rechazo..."
                                    rows="3"
                                    className="edit-modal-textarea"
                                />
                            </div>
                        )}

                        <div className="edit-modal-buttons">
                            <button
                                onClick={() => handleSaveEdit(editing)}
                                disabled={processing}
                                className="edit-modal-btn edit-modal-btn-save"
                            >
                                <CheckCircle size={16} />
                                {processing ? "Guardando..." : "Guardar Cambios"}
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                disabled={processing}
                                className="edit-modal-btn edit-modal-btn-cancel"
                            >
                                <XCircle size={16} />
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}