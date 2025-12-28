"use strict";
import { useState, useRef } from "react";
import { FiTag, FiSettings, FiDroplet, FiHash, FiCamera, FiUser, FiEdit3, FiChevronRight, FiX } from "react-icons/fi"; // Se agregó FiX
import { useGetPrivateBicycles } from "@hooks/bicycles/useGetPrivateBicycles";
import { useUpdateBicycles } from "@hooks/bicycles/useUpdateBicycles";

const BicycleProfile = () => {
    const { isLoading, bicycles, error } = useGetPrivateBicycles();
    const { execute: updateBicycle, loading: isUpdating } = useUpdateBicycles();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showModal, setShowModal] = useState(false); // Nuevo estado para el modal
    const fileInputRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const currentBicycle = bicycles ? bicycles[currentIndex] : null;

    const formatUrl = (path) => {
        if (!path) return null;
        return `${API_URL}/${path.replace(/\\/g, "/").replace("src/", "")}`;
    };

    return (
        <div className="min-h-screen bg-blue p-4 md:p-10 text-white font-sans">
            {showModal && currentBicycle?.photo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-zoom-out"
                    onClick={() => setShowModal(false)}>
                    <img 
                        src={formatUrl(currentBicycle.photo)} 
                        className="max-w-full max-h-full rounded-lg shadow-2xl object-contain animate-in zoom-in duration-300"
                        alt="Bicicleta Grande"
                    />
                </div>
            )}

            {!isLoading && currentBicycle && (
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[#272e4b]/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/10 p-8 flex flex-col items-center">
                            
                            <div className="relative mb-8">
                                <div className="w-48 h-48 rounded-full border-4 border-[#3b82f6]/30 p-1 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/20 bg-[#1a1f37]">
                                        {currentBicycle.photo ? (
                                            <img 
                                                src={formatUrl(currentBicycle.photo)} 
                                                className="w-full h-full object-cover"
                                                alt="Bicicleta"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-white/20">
                                                <FiSettings size={60} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-bold tracking-tight text-white">{currentBicycle.brand}</h2>
                                <div className="mt-2 inline-block px-4 py-1 rounded-full bg-[#3b82f6]/20 border border-[#3b82f6]/30 text-[#3b82f6] text-xs font-bold uppercase tracking-widest">
                                    {currentBicycle.model}
                                </div>
                            </div>

                            <div className="w-full space-y-4">
                                <button 
                                    onClick={() => setShowModal(true)} 
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-[#3b82f6] text-white rounded-2xl font-bold shadow-lg shadow-blue-900/20 hover:bg-[#2563eb] transition-all active:scale-95"
                                >
                                    <FiUser size={18} />
                                    Ver Perfil
                                </button>
                                <button className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all backdrop-blur-sm">
                                    <FiEdit3 size={18} />
                                    Editar Perfil
                                </button>
                            </div>
                        </div>

                        {bicycles.length > 1 && (
                            <div className="bg-gradient-to-r from-[#272e4b]/60 to-[#3b82f6]/20 rounded-2xl p-6 flex justify-between items-center border border-white/10 shadow-xl">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Bicicletas</p>
                                    <p className="font-bold text-lg text-white">{currentIndex + 1} <span className="text-white/30 text-sm">/ {bicycles.length}</span></p>
                                </div>
                                <button 
                                    onClick={() => setCurrentIndex((prev) => (prev + 1) % bicycles.length)}
                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-[#3b82f6]"
                                >
                                    <FiChevronRight size={28} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-8">
                        <div className="bg-[#272e4b]/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/10 h-full overflow-hidden">
                            <div className="p-10 border-b border-white/5 flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Perfil Bicicletas</h3>
                                </div>
                            </div>
                            
                            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                <InfoItem label="Marca Registrada" value={currentBicycle.brand} icon={<FiTag />} />
                                <InfoItem label="Modelo del Cuadro" value={currentBicycle.model} icon={<FiSettings />} />
                                <InfoItem label="Color Primario" value={currentBicycle.color} icon={<FiDroplet />} />
                                <InfoItem label="Número de Identificación" value={currentBicycle.serialNumber} icon={<FiHash />} />
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

const InfoItem = ({ label, value, icon }) => (
    <div className="flex items-center gap-6 group">
        <div className="p-4 bg-white/5 rounded-2xl text-[#3b82f6] border border-white/10 group-hover:bg-[#3b82f6] group-hover:text-white transition-all duration-300 shadow-lg">
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em] mb-1">{label}</p>
            <p className="text-white font-bold text-xl tracking-wide">{value || "---"}</p>
        </div>
    </div>
);

export default BicycleProfile;