"use strict";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
    const navigate = useNavigate();

    return (
        <aside className="w-50 min-h-screen bg-gray-800 shadow-lg flex flex-col p-4">
            <nav className="flex flex-col gap-2 mt-4">
                
                <button 
                    className="text-left px-4 py-2 text-white hover:bg-gray-700 hover:pl-6 transition-all"
                    onClick={() => navigate("/home/user")}
                >
                    Home
                </button>

                <button 
                    className="text-left px-4 py-2 text-white text-white hover:bg-gray-700 hover:pl-6 transition-all"
                    onClick={() => navigate("/home/user/privateProfile")}
                >
                    Perfil
                </button>

                <button 
                    className="text-left px-4 py-2 text-white hover:bg-gray-700 hover:pl-6 transition-all"
                    onClick={() => navigate("/home/user/bicycles")}
                >
                    Perfil bicicletas
                </button>

                <button 
                    className="text-left px-4 py-2 text-white hover:bg-gray-700 hover:pl-6 transition-all"
                    onClick={() => navigate("/home/user/reserve")}
                >
                    Reservas
                </button>

                <button 
                    className="text-left px-4 py-2 text-white hover:bg-gray-700 hover:pl-6 transition-all"
                    onClick={() => navigate("/home/user/bycicles")}
                >
                    Añadir bicicletas
                </button>
            </nav>
        </aside>
    );
};

export default Sidebar;