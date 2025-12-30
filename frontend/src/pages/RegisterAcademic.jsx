import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '@services/auth.service';
import fondoAcademico from '../assets/fondo-academico.png';
import { User, Mail, Phone, IdCard, Lock, Eye, EyeOff, Bike, ArrowLeft } from "lucide-react";

const SubmitButtonWithEffect = ({ children, style, onMouseEnter, onMouseLeave, onMouseDown, onMouseUp, ...props }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = (e) => {
        setIsHovered(true);
        onMouseEnter && onMouseEnter(e);
    };

    const handleMouseLeave = (e) => {
        setIsHovered(false);
        onMouseLeave && onMouseLeave(e);
    };

    return (
        <button
            {...props}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            style={{
                ...style,
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <span style={{
                position: 'absolute',
                top: 0,
                left: isHovered ? '100%' : '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                transition: 'left 0.5s ease',
                pointerEvents: 'none'
            }} />
            {children}
        </button>
    );
};

export default function RegisterAcademic() {
    const navigate = useNavigate();

    const styles = {
        registerBackground: {
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 1
        },
        registerContainer: {
            position: 'absolute', zIndex: 2, width: '85%', maxWidth: '700px',
            minWidth: '300px', padding: '2rem', background: 'rgba(13, 25, 40, 0.92)',
            borderRadius: '20px', backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(163, 193, 255, 0.1)',
            left: '6%', top: '50%', transform: 'translateY(-50%)', overflowY: 'auto',
            maxHeight: '90vh', border: '1px solid rgba(163, 193, 255, 0.15)'
        },
        registerTitle: {
            fontFamily: "'Poppins', sans-serif", color: '#ffffff', fontSize: '36px',
            fontWeight: 700, marginBottom: '1.5rem', marginTop: '0.5rem',
            textAlign: 'center', textShadow: '0 4px 20px rgba(163, 193, 255, 0.3)',
            letterSpacing: '0.5px'
        },
        iconBack: {
            background: 'rgba(163, 193, 255, 0.1)', border: '2px solid rgba(163, 193, 255, 0.2)',
            cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center',
            marginBottom: '10px', padding: '10px', borderRadius: '12px',
            transition: 'all 0.3s ease', width: 'fit-content'
        },
        formGroup: { position: 'relative', marginBottom: '1.5rem' },
        formLabel: {
            fontFamily: "'Poppins', sans-serif", fontSize: '20px', fontWeight: 600,
            color: '#ffffff', display: 'block', marginBottom: '12px',
            paddingBottom: '2px', textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            letterSpacing: '0.3px'
        },
        inputWrapper: {
            position: 'relative', display: 'flex', alignItems: 'center', width: '100%'
        },
        inputIcon: {
            position: 'absolute', left: '16px', color: '#3e4856',
            pointerEvents: 'none', zIndex: 3, transition: 'all 0.3s ease'
        },
        formInput: {
            width: '100%', padding: '16px 16px 16px 50px',
            background: 'linear-gradient(135deg, #cadbfe 0%, #d4e4ff 100%)',
            fontFamily: "'Nunito', sans-serif", fontSize: '18px', fontWeight: 600,
            color: '#0d1928', border: '2px solid rgba(163, 193, 255, 0.3)',
            borderRadius: '14px', outline: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
        },
        addBicycleButton: {
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '10px', background: 'linear-gradient(135deg, #4b678d 0%, #5a7aa0 100%)',
            fontFamily: "'Poppins', sans-serif", fontSize: '18px', fontWeight: 600,
            color: 'white', padding: '16px', width: '100%',
            marginTop: '0.8rem', marginBottom: '1rem',
            border: '2px solid rgba(163, 193, 255, 0.2)', borderRadius: '14px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
        },
        submitButton: {
            background: 'linear-gradient(135deg, #354a66 0%, #4b678d 100%)',
            fontFamily: "'Poppins', sans-serif", fontSize: '22px', padding: '18px',
            minHeight: '60px', fontWeight: 700, color: 'white', width: '100%',
            marginTop: '0.6rem', border: 'none', borderRadius: '16px',
            letterSpacing: '0.8px', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer', boxShadow: '0 8px 30px rgba(53, 74, 102, 0.4)',
            position: 'relative', overflow: 'hidden'
        },
        togglePass: {
            position: 'absolute', right: '14px', top: '50%',
            transform: 'translateY(-50%)', background: 'rgba(59, 130, 246, 0.1)',
            border: 'none', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 3,
            padding: '8px', borderRadius: '8px', transition: 'all 0.3s ease'
        },
        modalOverlay: {
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0, 0, 0, 0.5)', zIndex: 3,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        },
        modalBici: {
            background: 'rgba(13, 25, 40, 0.9)', width: '450px', padding: '2rem',
            borderRadius: '18px', position: 'relative',
            animation: 'aparecer 0.3s ease-out'
        },
        modalTitle: {
            fontFamily: "'Poppins', sans-serif", fontSize: '28px', fontWeight: 700,
            color: 'white', marginBottom: '1rem', textAlign: 'center'
        },
        modalCerrar: {
            position: 'absolute', right: '12px', top: '12px',
            background: '#a3c1ff', color: '#0d1928', fontSize: '18px',
            width: '32px', height: '32px', borderRadius: '50%',
            border: 'none', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
        },
        fileBtn: {
            display: 'flex', alignItems: 'center', gap: '10px',
            background: '#cadbfe', padding: '12px 18px', borderRadius: '14px',
            fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: 600,
            color: '#0d1928', cursor: 'pointer', width: 'fit-content',
            transition: '0.3s ease', marginTop: '8px',
            position: 'relative', overflow: 'hidden'
        },
        fileInput: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer'
        },
        fileName: {
            fontFamily: "'Nunito', sans-serif", fontSize: '15px', fontWeight: 600,
            color: '#cadbfe', marginTop: '6px', textAlign: 'center'
        },
        loadingMessage: {
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white', padding: '16px 24px', borderRadius: '12px',
            fontFamily: "'Nunito', sans-serif", fontSize: '16px', zIndex: 1000,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        },
        successMessage: {
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white', padding: '16px 24px', borderRadius: '12px',
            fontFamily: "'Nunito', sans-serif", fontSize: '16px', zIndex: 1000,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        },
        errorMessage: {
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white', padding: '16px 24px', borderRadius: '12px',
            fontFamily: "'Nunito', sans-serif", fontSize: '16px', zIndex: 1000,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center',
            maxWidth: '90%'
        },
        errorList: {
            margin: '8px 0 0 0', padding: 0, listStyle: 'none'
        },
        errorListItem: {
            fontSize: '14px', fontFamily: "'Nunito', sans-serif",
            textAlign: 'center', padding: '4px 0'
        },
        fadeIn: {
            animation: 'fadeIn 0.3s ease'
        },
        fadeOut: {
            animation: 'fadeOut 0.4s ease forwards'
        },
        errorBox: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        }
    };

    const [formData, setFormData] = useState({
        names: '',
        lastName: '',
        rut: '',
        email: '',
        password: '',
        contact: '',
        typePerson: 'academico',
    });
    const [bicycle, setBicycle] = useState({ brand: '', model: '', color: '' });
    const [photo, setPhoto] = useState(null);
    const [mostrarBici, setMostrarBici] = useState(false);
    const [mostrarPass, setMostrarPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [errors, setErrors] = useState([]);
    const colorIcono = "#3e4856";

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleBicycleChange = (e) =>
        setBicycle({ ...bicycle, [e.target.name]: e.target.value });
    const handleFileChange = (e) => {
        if (e.target.name === 'photo') setPhoto(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');
        setErrors([]);

        const form = new FormData();
        Object.entries(formData).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') form.append(k, v);
        });

        if (bicycle.brand || bicycle.model || bicycle.color) {
            form.append('bicycle', JSON.stringify(bicycle));
        }

        if (photo) form.append('photo', photo);
        try {
            const res = await register(form);
            console.log('Registro académico:', res);

            if (res) {
                setSuccessMessage('Formulario enviado con éxito');
                setTimeout(() => {
                    navigate('/auth/login');
                }, 2000);
            } else {
                setErrorMessage('Hubo un error al enviar el formulario');
            }
        } catch (err) {
            console.error('Error al registrar:', err);

            if (err?.errorDetails && Array.isArray(err.errorDetails)) {
                setErrors(err.errorDetails);
                setErrorMessage(err.message);
            } else if (err?.message) {
                setErrorMessage(err.message);
            } else {
                setErrorMessage('Ocurrió un error inesperado');
            }
            setTimeout(() => {
                setErrorMessage('');
                setErrors([]);
            }, 3000);
        } finally {
            setLoading(false);
        }
    };

    const animationStyles = `
        @keyframes aparecer {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        
        @keyframes fadeOut {
            from {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            to {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
        }
        
        .register-container::-webkit-scrollbar {
            width: 10px;
        }
        
        .register-container::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #4b678d 0%, #6b88b4 100%);
            border-radius: 10px;
            border: 2px solid rgba(13, 25, 40, 0.3);
        }
        
        .register-container::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #5a7aa0 0%, #7a98c4 100%);
        }
        
        .register-container::-webkit-scrollbar-track {
            background: rgba(44, 62, 80, 0.5);
            border-radius: 10px;
            margin: 10px 0;
        }
    `;

    return (
        <>
            <style>{animationStyles}</style>
            <div style={{ ...styles.registerBackground, backgroundImage: `url(${fondoAcademico})` }}></div>

            <div style={styles.registerContainer}>
                <button
                    style={styles.iconBack}
                    onClick={() => navigate("/auth/register")}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(163, 193, 255, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(163, 193, 255, 0.4)';
                        e.currentTarget.style.transform = 'translateX(-5px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(163, 193, 255, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(163, 193, 255, 0.2)';
                        e.currentTarget.style.transform = 'translateX(0)';
                    }}
                >
                    <ArrowLeft size={26} color="white" />
                </button>

                <h2 style={styles.registerTitle}>Solicitud de Registro</h2>

                <form onSubmit={handleSubmit}>
                    {loading && <div style={styles.loadingMessage}>Cargando...</div>}
                    {successMessage && <div style={styles.successMessage}>{successMessage}</div>}
                    {(errorMessage || errors.length > 0) && (
                        <div style={{ ...styles.errorMessage, ...styles.errorBox }}>
                            <strong>{errorMessage}</strong>
                            {errors.length > 0 && (
                                <ul style={styles.errorList}>
                                    {errors.map((e, i) => (
                                        <li style={styles.errorListItem} key={i}>{e}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <div style={styles.formGroup}>
                        <label style={styles.formLabel}>NOMBRES</label>
                        <div style={styles.inputWrapper}>
                            <User size={20} color={colorIcono} style={styles.inputIcon} />
                            <input
                                name='names'
                                placeholder='Valentina Lucía'
                                onChange={handleChange}
                                style={styles.formInput}
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.formLabel}>APELLIDOS</label>
                        <div style={styles.inputWrapper}>
                            <User size={20} color={colorIcono} style={styles.inputIcon} />
                            <input
                                name='lastName'
                                placeholder='Martínez López'
                                onChange={handleChange}
                                style={styles.formInput}
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.formLabel}>RUT</label>
                        <div style={styles.inputWrapper}>
                            <IdCard size={20} color={colorIcono} style={styles.inputIcon} />
                            <input
                                name='rut'
                                placeholder='11111111-1'
                                onChange={handleChange}
                                style={styles.formInput}
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.formLabel}>CORREO ELECTRÓNICO</label>
                        <div style={styles.inputWrapper}>
                            <Mail size={20} color={colorIcono} style={styles.inputIcon} />
                            <input
                                name='email'
                                placeholder='ejemplo@gmail.com'
                                onChange={handleChange}
                                style={styles.formInput}
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.formLabel}>CONTRASEÑA</label>
                        <div style={styles.inputWrapper}>
                            <Lock size={20} color={colorIcono} style={styles.inputIcon} />
                            <input
                                name='password'
                                type={mostrarPass ? "text" : "password"}
                                placeholder='*******'
                                onChange={handleChange}
                                style={styles.formInput}
                            />
                            <button
                                type="button"
                                style={styles.togglePass}
                                onClick={() => setMostrarPass(!mostrarPass)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                                }}
                                onMouseDown={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-50%) scale(0.95)';
                                }}
                                onMouseUp={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                                }}
                            >
                                {mostrarPass ? <EyeOff size={20} color={colorIcono} /> : <Eye size={20} color={colorIcono} />}
                            </button>
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.formLabel}>NÚMERO DE CONTACTO</label>
                        <div style={styles.inputWrapper}>
                            <Phone size={20} color={colorIcono} style={styles.inputIcon} />
                            <input
                                name='contact'
                                placeholder='56911111111'
                                onChange={handleChange}
                                style={styles.formInput}
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        style={styles.addBicycleButton}
                        onClick={() => setMostrarBici(true)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(163, 193, 255, 0.3)';
                            e.currentTarget.style.background = 'linear-gradient(135deg, #5a7aa0 0%, #6b88b4 100%)';
                            e.currentTarget.style.borderColor = 'rgba(163, 193, 255, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                            e.currentTarget.style.background = 'linear-gradient(135deg, #4b678d 0%, #5a7aa0 100%)';
                            e.currentTarget.style.borderColor = 'rgba(163, 193, 255, 0.2)';
                        }}
                        onMouseDown={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseUp={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                        }}
                    >
                        <Bike size={18} color="white" /> AGREGAR BICICLETA (Opcional)
                    </button>

                    <SubmitButtonWithEffect
                        type='submit'
                        style={styles.submitButton}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(53, 74, 102, 0.5)';
                            e.currentTarget.style.background = 'linear-gradient(135deg, #4b678d 0%, #5a7aa0 100%)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 8px 30px rgba(53, 74, 102, 0.4)';
                            e.currentTarget.style.background = 'linear-gradient(135deg, #354a66 0%, #4b678d 100%)';
                        }}
                        onMouseDown={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseUp={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                    >
                        ENVIAR SOLICITUD
                    </SubmitButtonWithEffect>
                </form>

                {mostrarBici && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modalBici}>
                            <button
                                style={styles.modalCerrar}
                                onClick={() => setMostrarBici(false)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#c1d4ff';
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#a3c1ff';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                                onMouseDown={(e) => {
                                    e.currentTarget.style.transform = 'scale(0.95)';
                                }}
                                onMouseUp={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                }}
                            >
                                ✕
                            </button>
                            <h3 style={styles.modalTitle}>Registrar bicicleta</h3>

                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>MARCA</label>
                                <div style={styles.inputWrapper}>
                                    <Bike size={20} color={colorIcono} style={styles.inputIcon} />
                                    <input
                                        name="brand"
                                        placeholder="Oxford"
                                        value={bicycle.brand}
                                        onChange={handleBicycleChange}
                                        style={styles.formInput}
                                    />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>MODELO</label>
                                <div style={styles.inputWrapper}>
                                    <Bike size={20} color={colorIcono} style={styles.inputIcon} />
                                    <input
                                        name="model"
                                        placeholder="MTB 300"
                                        value={bicycle.model}
                                        onChange={handleBicycleChange}
                                        style={styles.formInput}
                                    />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>COLOR</label>
                                <div style={styles.inputWrapper}>
                                    <Bike size={20} color={colorIcono} style={styles.inputIcon} />
                                    <input
                                        name="color"
                                        placeholder="Azul"
                                        value={bicycle.color}
                                        onChange={handleBicycleChange}
                                        style={styles.formInput}
                                    />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>FOTO DE LA BICICLETA</label>
                                <label
                                    style={styles.fileBtn}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 10px rgba(163, 193, 255, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                    onMouseDown={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseUp={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                >
                                    <Bike size={18} color={colorIcono} />
                                    <span>Seleccionar archivo</span>
                                    <input
                                        type="file"
                                        name="photo"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={styles.fileInput}
                                    />
                                </label>
                                {photo && <p style={styles.fileName}>{photo.name}</p>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}