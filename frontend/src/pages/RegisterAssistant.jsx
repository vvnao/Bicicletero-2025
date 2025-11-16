import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '@services/auth.service';
import '../styles/RegisterAssistant.css';

export default function RegisterAssistant() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    names: '',
    lastName: '',
    rut: '',
    email: '',
    password: '',
    contact: '',
    typePerson: 'funcionario',
    position: '',
    positionDescription: '',
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

    if (bicycle.brand || bicycle.model || bicycle.color) {
      form.append('bicycle', JSON.stringify(bicycle));
    }

    if (photo) form.append('photo', photo);
    const res = await register(form);
    console.log('Registro funcionario:', res);
    alert(res.message || 'Registro enviado');
    navigate('/auth/login');
  };

  return (
    <div className='register-assistant-container'>
      <h2 className='register-assistant-title'>Registro — Funcionario</h2>

      <button
        type='button'
        onClick={() => navigate('/auth/register')}
        className='register-assistant-back-button'
      >
        ← Cambiar tipo de registro
      </button>

      <form onSubmit={handleSubmit}>
        <div className='register-assistant-form-group'>
          <input
            name='names'
            placeholder='Nombres'
            onChange={handleChange}
            className='register-assistant-form-input'
            required
          />
        </div>

        <div className='register-assistant-form-group'>
          <input
            name='lastName'
            placeholder='Apellidos'
            onChange={handleChange}
            className='register-assistant-form-input'
            required
          />
        </div>

        <div className='register-assistant-form-group'>
          <input
            name='rut'
            placeholder='RUT'
            onChange={handleChange}
            className='register-assistant-form-input'
            required
          />
        </div>

        <div className='register-assistant-form-group'>
          <input
            name='email'
            placeholder='Correo electrónico'
            onChange={handleChange}
            className='register-assistant-form-input'
            required
          />
        </div>

        <div className='register-assistant-form-group'>
          <input
            name='password'
            type='password'
            placeholder='Contraseña'
            onChange={handleChange}
            className='register-assistant-form-input'
            required
          />
        </div>

        <div className='register-assistant-form-group'>
          <input
            name='contact'
            placeholder='Contacto (teléfono)'
            onChange={handleChange}
            className='register-assistant-form-input'
          />
        </div>

        <div className='register-assistant-position-section'>
          <h3 className='register-assistant-position-title'>
            Información del Cargo
          </h3>

          <div className='register-assistant-form-group'>
            <input
              name='position'
              placeholder='Cargo'
              onChange={handleChange}
              className='register-assistant-form-input'
              required
            />
          </div>

          <div className='register-assistant-form-group'>
            <input
              name='positionDescription'
              placeholder='Descripción del cargo'
              onChange={handleChange}
              className='register-assistant-form-input'
              required
            />
          </div>
        </div>

        <h3 className='register-assistant-section-title'>
          Datos de la bicicleta
          <span className='register-assistant-optional-badge'>Opcional</span>
        </h3>

        <div className='register-assistant-form-group'>
          <input
            name='brand'
            placeholder='Marca (ej. Oxford)'
            value={bicycle.brand}
            onChange={handleBicycleChange}
            className='register-assistant-form-input'
          />
        </div>

        <div className='register-assistant-form-group'>
          <input
            name='model'
            placeholder='Modelo (ej. Eco)'
            value={bicycle.model}
            onChange={handleBicycleChange}
            className='register-assistant-form-input'
          />
        </div>

        <div className='register-assistant-form-group'>
          <input
            name='color'
            placeholder='Color (ej. Amarillo)'
            value={bicycle.color}
            onChange={handleBicycleChange}
            className='register-assistant-form-input'
          />
        </div>

        <div className='register-assistant-form-group'>
          <label className='register-assistant-form-label'>
            Foto de la bicicleta
          </label>
          <input
            type='file'
            name='photo'
            accept='image/*'
            onChange={handleFileChange}
            className='register-assistant-file-input'
          />
        </div>

        <button
          type='submit'
          className='register-assistant-submit-button'
        >
          Registrarse
        </button>
      </form>
    </div>
  );
}
