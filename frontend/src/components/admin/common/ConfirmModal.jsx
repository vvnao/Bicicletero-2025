// frontend/src/components/common/ConfirmModal.jsx
export const ConfirmModal = ({ 
    title, 
    message, 
    onConfirm, 
    onCancel,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'warning'
}) => {
    const typeStyles = {
        warning: {
            icon: '⚠️',
            confirmColor: '#dc3545',
            confirmBg: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
        },
        danger: {
            icon: '🗑️',
            confirmColor: '#dc3545',
            confirmBg: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
        },
        success: {
            icon: '✅',
            confirmColor: '#28a745',
            confirmBg: 'linear-gradient(135deg, #28a745 0%, #218838 100%)'
        }
    };
    
    const style = typeStyles[type] || typeStyles.warning;
    
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '30px',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                animation: 'scaleIn 0.3s ease-out'
            }}>
                <div style={{ 
                    fontSize: '48px', 
                    textAlign: 'center', 
                    marginBottom: '20px' 
                }}>
                    {style.icon}
                </div>
                <div style={{ 
                    textAlign: 'center', 
                    marginBottom: '25px' 
                }}>
                    <div style={{ 
                        fontWeight: '700', 
                        fontSize: '20px', 
                        color: '#2c3e50',
                        marginBottom: '10px' 
                    }}>
                        {title}
                    </div>
                    <div style={{ 
                        fontSize: '15px', 
                        color: '#34495e', 
                        lineHeight: '1.5' 
                    }}>
                        {message}
                    </div>
                </div>
                <div style={{ 
                    display: 'flex', 
                    gap: '12px' 
                }}>
                    <button 
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#f8f9fa',
                            color: '#6c757d',
                            fontWeight: '600',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#e9ecef'}
                        onMouseLeave={(e) => e.target.style.background = '#f8f9fa'}
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={onConfirm}
                        style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '8px',
                            border: 'none',
                            background: style.confirmBg,
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: `0 4px 15px ${style.confirmColor}40`
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};