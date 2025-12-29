// frontend/src/components/admin/GuardForm.jsx (VERSIÓN OPTIMIZADA)
import { useState } from 'react';

const GuardForm = ({ onSubmit, onCancel, initialData = {} }) => {
    const [formData, setFormData] = useState({
        names: '',
        lastName: '',
        email: '',
        rut: '',
        typePerson: 'funcionario',
        phone: '',
        address: '',
        emergencyContact: '',
        emergencyPhone: '',
        password: '',
        ...initialData
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.names.trim()) newErrors.names = 'Nombres son requeridos';
        if (!formData.lastName.trim()) newErrors.lastName = 'Apellidos son requeridos';
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Preparar datos para enviar
            const submissionData = {
                ...formData,
                // Si no hay password, no enviarlo (backend generará uno)
                ...(formData.password === '' && { password: undefined })
            };
            onSubmit(submissionData);
        }
    };

    const containerStyle = "flex flex-col gap-4";
    const inputContainerStyle = "flex flex-col gap-1";
    const labelStyle = "font-semibold text-gray-800 text-sm";
    const inputStyle = "px-3 py-2 rounded border border-gray-300 text-sm focus:outline-none focus:border-blue-500";
    const errorStyle = "text-red-500 text-xs";
    const hintStyle = "text-gray-500 text-xs";
    const gridStyle = "grid grid-cols-1 md:grid-cols-2 gap-4";

    return (
        <form onSubmit={handleSubmit} className={containerStyle}>
            {/* Nombre y Apellido */}
            <div className={gridStyle}>
                <div className={inputContainerStyle}>
                    <label className={labelStyle}>Nombres *</label>
                    <input
                        type="text"
                        name="names"
                        value={formData.names}
                        onChange={handleChange}
                        className={inputStyle}
                        placeholder="Juan Carlos"
                    />
                    {errors.names && <span className={errorStyle}>{errors.names}</span>}
                </div>

                <div className={inputContainerStyle}>
                    <label className={labelStyle}>Apellidos *</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={inputStyle}
                        placeholder="Pérez González"
                    />
                    {errors.lastName && <span className={errorStyle}>{errors.lastName}</span>}
                </div>
            </div>

            {/* Email */}
            <div className={inputContainerStyle}>
                <label className={labelStyle}>Email *</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputStyle}
                    placeholder="ejemplo@universidad.cl"
                />
                {errors.email && <span className={errorStyle}>{errors.email}</span>}
            </div>

            {/* RUT y Tipo Persona */}
            <div className={gridStyle}>
                <div className={inputContainerStyle}>
                    <label className={labelStyle}>RUT</label>
                    <input
                        type="text"
                        name="rut"
                        value={formData.rut}
                        onChange={handleChange}
                        className={inputStyle}
                        placeholder="12.345.678-9"
                    />
                    <span className={hintStyle}>Opcional - se generará automáticamente</span>
                </div>

                <div className={inputContainerStyle}>
                    <label className={labelStyle}>Tipo de Persona</label>
                    <select
                        name="typePerson"
                        value={formData.typePerson}
                        onChange={handleChange}
                        className={inputStyle}
                    >
                        <option value="funcionario">Funcionario</option>
                        <option value="estudiante">Estudiante</option>
                        <option value="externo">Externo</option>
                    </select>
                </div>
            </div>

            {/* Teléfono y Contraseña */}
            <div className={gridStyle}>
                <div className={inputContainerStyle}>
                    <label className={labelStyle}>Teléfono</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={inputStyle}
                        placeholder="+56912345678"
                    />
                </div>

                <div className={inputContainerStyle}>
                    <label className={labelStyle}>Contraseña</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={inputStyle}
                        placeholder="Dejar vacío para generar automática"
                    />
                    <span className={hintStyle}>Opcional - se generará automáticamente</span>
                </div>
            </div>

            {/* Dirección */}
            <div className={inputContainerStyle}>
                <label className={labelStyle}>Dirección</label>
                <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={inputStyle}
                    placeholder="Av. Principal #123"
                />
            </div>

            {/* Contacto Emergencia */}
            <div className={gridStyle}>
                <div className={inputContainerStyle}>
                    <label className={labelStyle}>Contacto Emergencia</label>
                    <input
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        className={inputStyle}
                        placeholder="Nombre del contacto"
                    />
                </div>

                <div className={inputContainerStyle}>
                    <label className={labelStyle}>Tel. Emergencia</label>
                    <input
                        type="tel"
                        name="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={handleChange}
                        className={inputStyle}
                        placeholder="+56987654321"
                    />
                </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 mt-6">
                <button 
                    type="button" 
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                    Cancelar
                </button>
                <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    Crear Guardia
                </button>
            </div>
        </form>
    );
};

export default GuardForm;