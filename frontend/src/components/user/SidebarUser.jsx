"use strict";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "@services/auth.service.js";
import { FiArchive, FiLogOut, FiUser, FiPlus, FiHome} from 'react-icons/fi';
import { FaBicycle } from 'react-icons/fa';

const Sidebar = ({ sidebarHover, setSidebarHover }) => {
    const [activeItem, setActiveItem] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { name: "Perfil", path: "/home/user/privateProfile", icon: FiUser },
        { name: "Perfil bicicletas", path: "/home/user/bicycles", icon: FaBicycle },
        { name: "Reservas", path: "/home/user/reserve", icon: FiArchive },
        { name: "Añadir bicicletas", path: "/home/user/addBicycles", icon: FiPlus },
    ];

    useEffect(() => {
        const matchedItem = menuItems.find(item => location.pathname === item.path);
        if (matchedItem) {
            setActiveItem(matchedItem.name.toLowerCase());
        }
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate("/auth/login", { replace: true });
    };

    return (
        <aside
            onMouseEnter={() => setSidebarHover(true)}
            onMouseLeave={() => setSidebarHover(false)}
            className={`fixed left-0 top-0 h-screen bg-[#323954] transition-all duration-300 ease-in-out z-[1000] flex flex-col justify-between border-r border-white/5 rounded-r-[20px] shadow-2xl ${
                sidebarHover ? "w-[240px]" : "w-[80px]"
            }`}
        >
            <div>
                <div className={`p-6 pt-12 flex items-center border-b border-white/10 mb-8 transition-all duration-300 ${
                    sidebarHover ? "justify-start px-8" : "justify-center"
                }`}>
                    <div className={`font-semibold text-white transition-opacity duration-200 whitespace-nowrap leading-tight ${
                        sidebarHover ? "opacity-100" : "opacity-0 hidden"
                    }`}>
                        <div className="text-[#4a90e2] text-xl">Mi cuenta</div>
                    </div>
                    {!sidebarHover && <FiHome className="text-[#4a90e2] text-2xl" />}
                </div>

                <nav className="flex flex-col gap-4">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = activeItem === item.name.toLowerCase();

                        return (
                            <button
                                key={index}
                                onClick={() => navigate(item.path)}
                                className={`group relative flex items-center gap-4 py-3.5 px-5 mx-3 transition-all duration-300 rounded-l-xl ${
                                    isActive 
                                    ? "bg-[#252e4b] text-white border-l-4 border-[#4a90e2] ml-4 w-[calc(100%-16px)]" 
                                    : "text-[#a0a7c2] hover:bg-[#19213f2d] hover:text-white w-[calc(100%-24px)]"
                                }`}
                            >
                                <div className={`min-w-[24px] flex justify-center items-center transition-colors duration-200 ${
                                    isActive ? "text-[#4a90e2]" : "group-hover:text-white"
                                }`}>
                                    <Icon size={23} />
                                </div>
                                <span className={`text-[15px] font-medium whitespace-nowrap transition-opacity duration-300 ${
                                    sidebarHover ? "opacity-100" : "opacity-0 pointer-events-none"
                                }`}>
                                    {item.name}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>
            <div className="border-t border-white/10 py-6">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 py-3.5 px-5 mx-4 transition-all duration-300 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-[#ff6b6b] w-[calc(100%-32px)]"
                >
                    <div className="min-w-[24px] flex justify-center items-center">
                        <FiLogOut size={20} />
                    </div>
                    <span className={`text-[15px] font-medium transition-opacity duration-300 ${
                        sidebarHover ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}>
                        Cerrar Sesión
                    </span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;