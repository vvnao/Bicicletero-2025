import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '@services/auth.service';
import '../styles/Register.css';
import '../styles/ModalBicycle.css';
import fondoAcademico from '../assets/fondo-academico.png';
import { User, Mail, Phone, IdCard, Lock, Eye, EyeOff, Bike, ArrowLeft } from "lucide-react";

export default function RegisterAcademic() {
    const navigate = useNavigate();
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

    const colorIcono = "#fcfcfcff";

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

    return (
        <>
            <div className='register-background' style={{ backgroundImage: `url(${fondoAcademico})` }}></div>

            <div className='register-container'>
                <button className="icon-back" onClick={() => navigate("/auth/register")}>
                    <ArrowLeft size={26} color="white" />
                </button>

                <h2 className='register-title'>Solicitud de Registro</h2>

                <form onSubmit={handleSubmit}>
                    {loading && <div className="loading-message">Cargando...</div>}
                    {successMessage && <div className="success-message">{successMessage}</div>}
                    {(errorMessage || errors.length > 0) && (
                        <div className="error-message error-box">
                            <strong>{errorMessage}</strong>

                            {errors.length > 0 && (
                                <ul className="error-list">
                                    {errors.map((e, i) => (
                                        <li key={i}>{e}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <div className='form-group'>
                        <label className='form-label'>NOMBRES</label>
                        <div className="input-wrapper">
                            <User size={20} color={colorIcono} className="input-icon" />
                            <input
                                name='names'
                                placeholder='Valentina Lucía'
                                onChange={handleChange}
                                className='form-input'
                                required
                            />
                        </div>
                    </div>

                    <div className='form-group'>
                        <label className='form-label'>APELLIDOS</label>
                        <div className="input-wrapper">
                            <User size={20} color={colorIcono} className="input-icon" />
                            <input
                                name='lastName'
                                placeholder='Martínez López'
                                onChange={handleChange}
                                className='form-input'
                                required
                            />
                        </div>
                    </div>

                    <div className='form-group'>
                        <label className='form-label'>RUT</label>
                        <div className="input-wrapper">
                            <IdCard size={20} color={colorIcono} className="input-icon" />
                            <input
                                name='rut'
                                placeholder='11111111-1'
                                onChange={handleChange}
                                className='form-input'
                                required
                            />
                        </div>
                    </div>

                    <div className='form-group'>
                        <label className='form-label'>CORREO ELECTRÓNICO</label>
                        <div className="input-wrapper">
                            <Mail size={20} color={colorIcono} className="input-icon" />
                            <input
                                name='email'
                                placeholder='ejemplo@gmail.com'
                                onChange={handleChange}
                                className='form-input'
                                required
                            />
                        </div>
                    </div>

                    <div className='form-group'>
                        <label className='form-label'>CONTRASEÑA</label>
                        <div className="input-wrapper">
                            <Lock size={20} color={colorIcono} className="input-icon" />
                            <input
                                name='password'
                                type={mostrarPass ? "text" : "password"}
                                placeholder='*******'
                                onChange={handleChange}
                                className='form-input'
                                required
                            />
                            <button type="button" className="toggle-pass" onClick={() => setMostrarPass(!mostrarPass)}>
                                {mostrarPass ? <EyeOff size={20} color={colorIcono} /> : <Eye size={20} color={colorIcono} />}
                            </button>
                        </div>
                    </div>

                    <div className='form-group'>
                        <label className='form-label'>NÚMERO DE CONTACTO</label>
                        <div className="input-wrapper">
                            <Phone size={20} color={colorIcono} className="input-icon" />
                            <input
                                name='contact'
                                placeholder='56911111111'
                                onChange={handleChange}
                                className='form-input'
                            />
                        </div>
                    </div>

                    <button type="button" className="add-bicycle-button" onClick={() => setMostrarBici(true)}>
                        <Bike size={18} color="white" /> AGREGAR BICICLETA (Opcional)
                    </button>

                    <button type='submit' className='submit-button'>
                        ENVIAR SOLICITUD
                    </button>
                </form>
                {mostrarBici && (
                    <div className="modal-overlay">
                        <div className="modal-bici">
                            <button className="modal-cerrar" onClick={() => setMostrarBici(false)}>✕</button>
                            <h3 className="modal-title">Registrar bicicleta</h3>

                            <div className='form-group'>
                                <label className="form-label">MARCA</label>
                                <div className="input-wrapper">
                                    <Bike size={20} color={colorIcono} className="input-icon" />
                                    <input
                                        name="brand"
                                        placeholder="Oxford"
                                        value={bicycle.brand}
                                        onChange={handleBicycleChange}
                                        className="form-input" />
                                </div>
                            </div>

                            <div className='form-group'>
                                <label className="form-label">MODELO</label>
                                <div className="input-wrapper">
                                    <Bike size={20} color={colorIcono} className="input-icon" />
                                    <input
                                        name="model"
                                        placeholder="MTB 300"
                                        value={bicycle.model}
                                        onChange={handleBicycleChange}
                                        className="form-input" />
                                </div>
                            </div>

                            <div className='form-group'>
                                <label className="form-label">COLOR</label>
                                <div className="input-wrapper">
                                    <Bike size={20} color={colorIcono} className="input-icon" />
                                    <input
                                        name="color"
                                        placeholder="Azul"
                                        value={bicycle.color}
                                        onChange={handleBicycleChange}
                                        className="form-input" />
                                </div>
                            </div>

                            <div className='form-group'>
                                <label className="form-label">FOTO DE LA BICICLETA</label>
                                <label className="file-btn">
                                    <Bike size={18} color={colorIcono} />
                                    <span>Seleccionar archivo</span>
                                    <input
                                        type="file"
                                        name="photo"
                                        accept="image/*"
                                        onChange={handleFileChange} />
                                </label>
                                {photo && <p className="file-name">{photo.name}</p>}
                            </div>
                        </div>
                    </div>
                )}
            </div >
        </>
    );
}
