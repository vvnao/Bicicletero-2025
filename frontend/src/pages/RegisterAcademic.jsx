import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '@services/auth.service';
import '../styles/RegisterAcademic.css';

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

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleBicycleChange = (e) =>
        setBicycle({ ...bicycle, [e.target.name]: e.target.value });
    const handleFileChange = (e) => {
        if (e.target.name === 'photo') setPhoto(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData();
        Object.entries(formData).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') form.append(k, v);
        });
        if (photo) form.append('photo', photo);
        const res = await register(form);
        console.log('Registro académico:', res);
        alert(res.message || 'Registro enviado');
        navigate('/auth/login');
    };

    return (
        <div className='register-academic-container'>
        <h2 className='register-academic-title'>Registro — Académico</h2>

        <button
            type='button'
            onClick={() => navigate('/auth/register')}
            className='register-academic-back-button'
        >
            ← Cambiar tipo de registro
        </button>

        <form onSubmit={handleSubmit}>
            <div className='register-academic-form-group'>
            <input
                name='names'
                placeholder='Nombres'
                onChange={handleChange}
                className='register-academic-form-input'
                required
            />
            </div>

            <div className='register-academic-form-group'>
            <input
                name='lastName'
                placeholder='Apellidos'
                onChange={handleChange}
                className='register-academic-form-input'
                required
            />
            </div>

            <div className='register-academic-form-group'>
            <input
                name='rut'
                placeholder='RUT'
                onChange={handleChange}
                className='register-academic-form-input'
                required
            />
            </div>

            <div className='register-academic-form-group'>
            <input
                name='email'
                placeholder='Correo electrónico'
                onChange={handleChange}
                className='register-academic-form-input'
                required
            />
            </div>

            <div className='register-academic-form-group'>
            <input
                name='password'
                type='password'
                placeholder='Contraseña'
                onChange={handleChange}
                className='register-academic-form-input'
                required
            />
            </div>

            <div className='register-academic-form-group'>
            <input
                name='contact'
                placeholder='Contacto (teléfono)'
                onChange={handleChange}
                className='register-academic-form-input'
            />
            </div>

            <h3 className='register-academic-section-title'>
            Datos de la bicicleta
            <span className='register-academic-optional-badge'>Opcional</span>
            </h3>

            <div className='register-academic-form-group'>
            <input
                name='brand'
                placeholder='Marca (ej. Oxford)'
                value={bicycle.brand}
                onChange={handleBicycleChange}
                className='register-academic-form-input'
            />
            </div>

            <div className='register-academic-form-group'>
            <input
                name='model'
                placeholder='Modelo (ej. Eco)'
                value={bicycle.model}
                onChange={handleBicycleChange}
                className='register-academic-form-input'
            />
            </div>

            <div className='register-academic-form-group'>
            <input
                name='color'
                placeholder='Color (ej. Amarillo)'
                value={bicycle.color}
                onChange={handleBicycleChange}
                className='register-academic-form-input'
            />
            </div>

            <div className='register-academic-form-group'>
            <label className='register-academic-form-label'>
                Foto de la bicicleta
            </label>
            <input
                type='file'
                name='photo'
                accept='image/*'
                onChange={handleFileChange}
                className='register-academic-file-input'
            />
            </div>

            <button
            type='submit'
            className='register-academic-submit-button'
            >
            Registrarse
            </button>
        </form>
        </div>
    );
}
