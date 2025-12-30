import { useEffect, useState } from 'react';
import { ReviewService } from '@services/review.service.js';
import { Inbox, Eye, CheckCircle, XCircle, Loader2, Bike, AlertTriangle, Check, X, Clock } from 'lucide-react';
import '@styles/PendingRequests.css';

export default function PendingUserRequests() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [rejectModal, setRejectModal] = useState({ show: false, userId: null, userName: '' });

    useEffect(() => {
        loadPendingUsers();
    }, []);

    const loadPendingUsers = async () => {
        try {
            setLoading(true);
            const res = await ReviewService.getPending();
            setPendingUsers(res.data || []);
        } catch (err) {
            setError(err.message || 'Error al cargar solicitudes');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!confirm('¿Estás seguro de aprobar esta solicitud?')) return;

        try {
            setProcessing(true);
            await ReviewService.approveUser(id);
            await loadPendingUsers();
            setSelectedUser(null);
            alert('Usuario aprobado exitosamente');
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (id, comment) => {
        if (!comment || comment.trim() === '') {
            alert('Debe ingresar un motivo de rechazo');
            return;
        }

        try {
            setProcessing(true);
            await ReviewService.rejectUser(id, comment);
            await loadPendingUsers();
            setSelectedUser(null);
            setRejectModal({ show: false, userId: null, userName: '' });
            alert('Usuario rechazado');
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setProcessing(false);
        }
    };

    const cleanPath = (path) => path?.replace("src\\", "").replace(/\\/g, "/");

    const userBikes = selectedUser?.bicycles || [];

    if (loading) {
        return (
            <div className="pending-requests-container">
                <div className="pending-requests-header">
                    <h1 className="pending-requests-title">
                        <span className="pending-requests-icon-container">
                            <Clock size={20} />
                        </span>
                        Solicitudes Pendientes
                    </h1>
                    <p className="pending-requests-description">Revisa y aprueba solicitudes de registro de usuarios</p>
                </div>
                <div className="pending-requests-loading">
                    <Loader2 size={48} className="pending-requests-loading-spinner" />
                    <p style={{ marginTop: '15px', color: '#64748b' }}>Cargando solicitudes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pending-requests-container">
                <div className="pending-requests-header">
                    <h1 className="pending-requests-title">
                        <span className="pending-requests-icon-container">
                            <Clock size={20} />
                        </span>
                        Solicitudes Pendientes
                    </h1>
                    <p className="pending-requests-description">Revisa y aprueba solicitudes de registro de usuarios</p>
                </div>
                <div className="pending-requests-error">
                    <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                    {error}
                </div>
            </div>
        );
    }

    if (pendingUsers.length === 0) {
        return (
            <div className="pending-requests-container">
                <div className="pending-requests-header">
                    <h1 className="pending-requests-title">
                        <span className="pending-requests-icon-container">
                            <Clock size={20} />
                        </span>
                        Solicitudes Pendientes
                    </h1>
                    <p className="pending-requests-description">Revisa y aprueba solicitudes de registro de usuarios</p>
                </div>
                <div className="pending-requests-empty">
                    <Inbox size={64} className="pending-requests-empty-icon" />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '10px' }}>
                        No hay solicitudes pendientes
                    </h3>
                    <p>Todas las solicitudes han sido procesadas.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pending-requests-container">
            <div className="pending-requests-header">
                <h1 className="pending-requests-title">
                    <span className="pending-requests-icon-container">
                        <Clock size={20} />
                    </span>
                    Solicitudes Pendientes
                </h1>
                <p className="pending-requests-description">{pendingUsers.length} solicitud(es) pendiente(s) de revisión</p>
            </div>

            <div className="pending-user-list">
                {pendingUsers.map((user) => (
                    <div key={user.id} className="pending-user-card">
                        <div className="pending-user-content">
                            <div className="pending-user-info">
                                <h3 className="pending-user-name">
                                    {user.names} {user.lastName}
                                </h3>
                                <p className="pending-user-email">
                                    {user.email}
                                </p>
                                <div className="pending-user-tags">
                                    <span className="pending-user-tag">
                                        RUT: {user.rut}
                                    </span>
                                    <span className="pending-user-tag">
                                        {user.typePerson}
                                    </span>
                                    {user.position && (
                                        <span className="pending-user-tag">
                                            {user.position}
                                        </span>
                                    )}
                                </div>

                                {user.bicycles && user.bicycles.length > 0 && (
                                    <div className="pending-user-bikes">
                                        <div className="pending-bikes-header">
                                            <Bike size={16} style={{ color: '#0ea5e9' }} />
                                            <span className="pending-bikes-title">
                                                Bicicleta(s) registrada(s)
                                            </span>
                                        </div>
                                        <div className="pending-bikes-list">
                                            {user.bicycles.map((bike, index) => (
                                                <div key={index} className="pending-bike-item">
                                                    {bike.brand} {bike.model} - {bike.color}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => setSelectedUser(user)}
                                    className="pending-btn pending-btn-view"
                                >
                                    <Eye size={16} />
                                    Ver Detalles
                                </button>
                            </div>
                        </div>

                        <div className="pending-user-actions">
                            <button
                                onClick={() => handleApprove(user.id)}
                                disabled={processing}
                                className="pending-btn pending-btn-approve"
                            >
                                <CheckCircle size={16} />
                                Aprobar
                            </button>
                            <button
                                onClick={() => setRejectModal({
                                    show: true,
                                    userId: user.id,
                                    userName: `${user.names} ${user.lastName}`
                                })}
                                disabled={processing}
                                className="pending-btn pending-btn-reject"
                            >
                                <XCircle size={16} />
                                Rechazar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedUser && (
                <div
                    className="pending-modal-overlay"
                    onClick={() => setSelectedUser(null)}
                >
                    <div
                        className="pending-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="pending-modal-title">
                            Información del Usuario
                        </h2>

                        <div className="pending-modal-section">
                            <p className="pending-user-detail">
                                <strong>Nombre:</strong> {selectedUser.names} {selectedUser.lastName}
                            </p>
                            <p className="pending-user-detail">
                                <strong>Email:</strong> {selectedUser.email}
                            </p>
                            <p className="pending-user-detail">
                                <strong>RUT:</strong> {selectedUser.rut}
                            </p>
                            <p className="pending-user-detail">
                                <strong>Tipo de persona:</strong> {selectedUser.typePerson}
                            </p>
                            {selectedUser.position && (
                                <p className="pending-user-detail">
                                    <strong>Cargo:</strong> {selectedUser.position}
                                </p>
                            )}
                            {selectedUser.positionDescription && (
                                <p className="pending-user-detail">
                                    <strong>Descripción del cargo:</strong> {selectedUser.positionDescription}
                                </p>
                            )}
                            <p className="pending-user-detail">
                                <strong>Contacto:</strong> {selectedUser.contact || 'No registrado'}
                            </p>
                            <p className="pending-user-detail">
                                <strong>Fecha de solicitud:</strong> {new Date(selectedUser.created_at).toLocaleString()}
                            </p>
                        </div>

                        {selectedUser.tnePhoto && (
                            <div className="pending-modal-section">
    <h3>TNE</h3>
    <img
        src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/${cleanPath(
            selectedUser.tnePhoto
        )}`}
        alt="TNE"
        className="pending-modal-image"
        onClick={() =>
            setPreviewImage(
                `${import.meta.env.VITE_API_URL.replace('/api', '')}/${cleanPath(
                    selectedUser.tnePhoto
                )}`
            )
        }
    />
</div>
                        )}

                        <div className="pending-modal-section">
                            <h3>Bicicleta(s)</h3>
                            {userBikes.length > 0 ? (
                                <div style={{ display: 'grid', gap: '15px' }}>
                                    {userBikes.map((bike, index) => (
                                        <div key={index} style={{
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '10px',
                                            padding: '15px',
                                            backgroundColor: '#f8fafc'
                                        }}>
                                            <p className="pending-user-detail">
                                                <strong>Marca:</strong> {bike.brand || '—'}
                                            </p>
                                            <p className="pending-user-detail">
                                                <strong>Modelo:</strong> {bike.model || '—'}
                                            </p>
                                            <p className="pending-user-detail">
                                                <strong>Color:</strong> {bike.color || '—'}
                                            </p>
                                            {bike.photo && (
                                                <div className="photo-container">
    <span className="pending-modal-image-label">Foto:</span>
    <img
        src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/${cleanPath(
            bike.photo
        )}`}
        alt="Bicicleta"
        className="pending-modal-image"
        onClick={() =>
            setPreviewImage(
                `${import.meta.env.VITE_API_URL.replace('/api', '')}/${cleanPath(
                    bike.photo
                )}`
            )
        }
    />
</div>

                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="pending-no-bikes">
                                    <Bike size={24} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                    <p>No hay bicicletas registradas</p>
                                </div>
                            )}
                        </div>

                        <div className="pending-modal-actions">
                            <button
                                onClick={() => handleApprove(selectedUser.id)}
                                disabled={processing}
                                className="pending-modal-btn pending-btn-approve"
                            >
                                <CheckCircle size={18} />
                                Aprobar
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedUser(null);
                                    setRejectModal({
                                        show: true,
                                        userId: selectedUser.id,
                                        userName: `${selectedUser.names} ${selectedUser.lastName}`
                                    });
                                }}
                                disabled={processing}
                                className="pending-modal-btn pending-btn-reject"
                            >
                                <XCircle size={18} />
                                Rechazar
                            </button>
                        </div>

                        <button
                            onClick={() => setSelectedUser(null)}
                            className="pending-modal-close"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {rejectModal.show && (
                <div
                    className="pending-modal-overlay"
                    onClick={() => setRejectModal({ show: false, userId: null, userName: '' })}
                >
                    <div
                        className="reject-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="reject-modal-title">
                            Rechazar solicitud
                        </h3>
                        <p className="reject-modal-text">
                            Estás a punto de rechazar la solicitud de <strong>{rejectModal.userName}</strong>.
                        </p>

                        <label htmlFor="rejectReason" className="reject-modal-label">
                            Motivo del rechazo:
                        </label>
                        <textarea
                            id="rejectReason"
                            placeholder="Describe el motivo del rechazo..."
                            rows="4"
                            className="reject-modal-textarea"
                        />

                        <div className="reject-modal-actions">
                            <button
                                onClick={() => setRejectModal({ show: false, userId: null, userName: '' })}
                                className="reject-modal-btn reject-modal-cancel"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    const comment = document.getElementById('rejectReason').value;
                                    handleReject(rejectModal.userId, comment);
                                }}
                                disabled={processing}
                                className="reject-modal-btn reject-modal-confirm"
                            >
                                {processing ? 'Procesando...' : 'Confirmar Rechazo'}
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
                    <img
                        src={previewImage}
                        alt="Preview"
                        className="image-preview"
                    />
                </div>
            )}
        </div>
    );
}