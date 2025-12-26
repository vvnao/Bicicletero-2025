"use strict";
import { useNavigate } from "react-router-dom";
import { logout } from "@services/auth.service.js";

const NavBar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/auth/login", { replace: true });
    };

    return (
        <header className="w-full h-[60px] bg-gray-800 text-white flex items-center justify-between px-6 py-10 shadow-md">
            <h1 className="text-3xl font-semibold">Bicicletero UBB</h1>
            <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700"
            >
                Cerrar sesión
            </button>
        </header>
    );
};

export default NavBar;
