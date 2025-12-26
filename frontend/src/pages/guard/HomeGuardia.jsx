import { useNavigate } from "react-router-dom";
import { logout } from "@services/auth.service.js";

function HomeGuardia() {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/auth/login", { replace: true });
    };

    return (
        <div className="p-8 text-center">
            <h1 className="text-2xl font-bold">Bienvenido Guardia del Bicicletero UBB 🚲</h1>
            <p className="mt-2">Panel de control para guardias</p>

            <div className="mt-6 space-x-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                    Ver bicicletas
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                    Registrar entrada/salida
                </button>
                <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                    Cerrar sesión
                </button>
            </div>
        </div>
    );
}

export default HomeGuardia;