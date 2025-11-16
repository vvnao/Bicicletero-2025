import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '@services/auth.service';
import '../styles/RegisterStudent.css';

export default function RegisterStudent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    names: '',
    lastName: '',
    rut: '',
    email: '',
    password: '',
    contact: '',
    typePerson: 'estudiante',
  });
  const [bicycle, setBicycle] = useState({ brand: '', model: '', color: '' });
  const [tnePhoto, setTnePhoto] = useState(null);
  const [photo, setPhoto] = useState(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleBicycleChange = (e) =>
    setBicycle({ ...bicycle, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    if (e.target.name === 'tnePhoto') setTnePhoto(e.target.files[0]);
    if (e.target.name === 'photo') setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') form.append(k, v);
    });

    if (bicycle.brand || bicycle.model || bicycle.color) {
      form.append('bicycle', JSON.stringify(bicycle));
    }

    if (tnePhoto) form.append('tnePhoto', tnePhoto);
    if (photo) form.append('photo', photo);

    const res = await register(form);
    console.log('Registro estudiante:', res);
    alert(res.message || 'Registro enviado');
    navigate('/auth/login');
  };

  return (
    <div className='register-container'>
      <h2 className='register-title'>Registro — Estudiante</h2>

      <button
        type='button'
        onClick={() => navigate('/auth/register')}
        className='back-button'
      >
        ← Cambiar tipo de registro
      </button>

      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <input
            name='names'
            placeholder='Nombres'
            onChange={handleChange}
            className='form-input'
            required
          />
        </div>

        <div className='form-group'>
          <input
            name='lastName'
            placeholder='Apellidos'
            onChange={handleChange}
            className='form-input'
            required
          />
        </div>

        <div className='form-group'>
          <input
            name='rut'
            placeholder='RUT'
            onChange={handleChange}
            className='form-input'
            required
          />
        </div>

        <div className='form-group'>
          <input
            name='email'
            placeholder='Correo electrónico'
            onChange={handleChange}
            className='form-input'
            required
          />
        </div>

        <div className='form-group'>
          <input
            name='password'
            type='password'
            placeholder='Contraseña'
            onChange={handleChange}
            className='form-input'
            required
          />
        </div>

        <div className='form-group'>
          <input
            name='contact'
            placeholder='Contacto (teléfono)'
            onChange={handleChange}
            className='form-input'
          />
        </div>

        <div className='form-group'>
          <label className='form-label'>
            Foto TNE (requerida para estudiantes)
          </label>
          <input
            type='file'
            name='tnePhoto'
            accept='image/*'
            onChange={handleFileChange}
            className='file-input'
            required
          />
        </div>

        <h3 className='section-title'>
          Datos de la bicicleta
          <span className='optional-badge'>Opcional</span>
        </h3>

        <div className='form-group'>
          <input
            name='brand'
            placeholder='Marca (ej. Oxford)'
            value={bicycle.brand}
            onChange={handleBicycleChange}
            className='form-input'
          />
        </div>

        <div className='form-group'>
          <input
            name='model'
            placeholder='Modelo (ej. Eco)'
            value={bicycle.model}
            onChange={handleBicycleChange}
            className='form-input'
          />
        </div>

        <div className='form-group'>
          <input
            name='color'
            placeholder='Color (ej. Amarillo)'
            value={bicycle.color}
            onChange={handleBicycleChange}
            className='form-input'
          />
        </div>

        <div className='form-group'>
          <label className='form-label'>Foto de la bicicleta</label>
          <input
            type='file'
            name='photo'
            accept='image/*'
            onChange={handleFileChange}
            className='file-input'
          />
        </div>

        <button
          type='submit'
          className='submit-button'
        >
          Registrarse
        </button>
      </form>
    </div>
  );
}
