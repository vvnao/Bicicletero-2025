import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "@services/auth.service";

export default function RegisterAssistant() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        names: "",
        lastName: "",
        rut: "",
        email: "",
        password: "",
        contact: "",
        typePerson: "funcionario",
        position: "",
        positionDescription: "",
    });
    const [bicycle, setBicycle] = useState({ brand: "", model: "", color: "" });
    const [photo, setPhoto] = useState(null);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleBicycleChange = (e) => setBicycle({ ...bicycle, [e.target.name]: e.target.value });
    const handleFileChange = (e) => {
        if (e.target.name === "photo") setPhoto(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData();
        Object.entries(formData).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== "") form.append(k, v);
        });

        if (bicycle.brand || bicycle.model || bicycle.color) {
            form.append("bicycle", JSON.stringify(bicycle));
        }

        if (photo) form.append("photo", photo);
        const res = await register(form);
        console.log("Registro funcionario:", res);
        alert(res.message || "Registro enviado");
        navigate("/auth/login");
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white rounded shadow">
            <h2 className="text-xl mb-3">Registro — Funcionario</h2>
            <button type="button" onClick={() => navigate("/auth/register")} className="text-sm text-blue-600 mb-3">← Cambiar tipo</button>

            <input name="names" placeholder="Nombres" onChange={handleChange} className="border p-2 rounded mb-2" required />
            <input name="lastName" placeholder="Apellidos" onChange={handleChange} className="border p-2 rounded mb-2" required />
            <input name="rut" placeholder="RUT" onChange={handleChange} className="border p-2 rounded mb-2" required />
            <input name="email" placeholder="Correo" onChange={handleChange} className="border p-2 rounded mb-2" required />
            <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} className="border p-2 rounded mb-2" required />
            <input name="contact" placeholder="Contacto" onChange={handleChange} className="border p-2 rounded mb-2" />

            <input name="position" placeholder="Cargo" onChange={handleChange} className="border p-2 rounded mb-2" required />
            <input name="positionDescription" placeholder="Descripción del cargo" onChange={handleChange} className="border p-2 rounded mb-2" required />

            <h3 className="mt-3 font-medium">Datos de la bicicleta (opcional)</h3>
            <input name="brand" placeholder="Marca (ej. Oxford)" value={bicycle.brand} onChange={handleBicycleChange} className="border p-2 rounded mb-2" />
            <input name="model" placeholder="Modelo (ej. Eco)" value={bicycle.model} onChange={handleBicycleChange} className="border p-2 rounded mb-2" />
            <input name="color" placeholder="Color (ej. Amarillo)" value={bicycle.color} onChange={handleBicycleChange} className="border p-2 rounded mb-2" />

            <label className="block mb-1">Foto de la bicicleta (opcional)</label>
            <input type="file" name="photo" accept="image/*" onChange={handleFileChange} className="mb-4" />

            <button type="submit" className="bg-blue-600 text-white p-2 rounded">Registrarse</button>
        </form>
    );
}