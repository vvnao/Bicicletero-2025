// frontend/src/components/common/Alert.jsx
import { useEffect } from 'react';

export const Alert = ({ type, title, message, onClose, duration = 5000 }) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);
    
    const alertStyles = {
        success: {
            background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
            borderColor: '#28a745',
            color: '#155724'
        },
        error: {
            background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
            borderColor: '#dc3545',
            color: '#721c24'
        },
        warning: {
            background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
            borderColor: '#ffc107',
            color: '#856404'
        },
        info: {
            background: 'linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)',
            borderColor: '#17a2b8',
            color: '#0c5460'
        }
    };
    
    const iconMap = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    const style = alertStyles[type] || alertStyles.info;
    
    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            minWidth: '300px',
            maxWidth: '400px',
            background: style.background,
            borderLeft: `5px solid ${style.borderColor}`,
            borderRadius: '10px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '15px',
            padding: '18px',
            zIndex: 9999,
            animation: 'slideInRight 0.3s ease-out',
            color: style.color
        }}>
            <div style={{ fontSize: '24px', flexShrink: 0, marginTop: '2px' }}>
                {iconMap[type]}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ 
                    fontWeight: '700', 
                    fontSize: '16px', 
                    marginBottom: '5px' 
                }}>
                    {title}
                </div>
                <div style={{ 
                    fontSize: '14px', 
                    lineHeight: '1.5' 
                }}>
                    {message}
                </div>
            </div>
            <button 
                onClick={onClose}
                style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: style.color,
                    opacity: '0.7',
                    padding: '0',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '1'}
                onMouseLeave={(e) => e.target.style.opacity = '0.7'}
            >
                ×
            </button>
        </div>
    );
};