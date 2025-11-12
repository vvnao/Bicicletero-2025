import { useNavigate } from "react-router-dom";
import { logout } from "@services/auth.service.js";

function Home() {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/auth/login", { replace: true });
    };

    return (
        <div className="p-8 text-center">
            <h1 className="text-2xl font-bold">Bienvenido al Bicicletero UBB 🚲</h1>
            <p className="mt-2">Has iniciado sesión correctamente.</p>

            <div className="mt-6">
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

export default Home;