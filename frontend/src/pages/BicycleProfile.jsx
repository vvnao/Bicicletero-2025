"use strict";
import { useState } from "react";
//Quiero ocupar estos iconos
//import { FaUsers, FaCalendarAlt, FaCheck, FaCoins } from "react-icons/fa";
import { useGetPrivateBicycles } from "@hooks/bicycles/useGetPrivateBicycles";

const BicycleProfile = () => {
    const { isLoading, bicycles, error } = useGetPrivateBicycles();
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % bicycles.length);
    };

    const currentBicycle = bicycles ? bicycles[currentIndex] : null;

    return (
        <div className="flex flex-col min-h-screen bg-[#272e4b]">
            
            <div className="flex flex-1">
                
                <main className="flex-1 p-8 transition-all duration-300">
                    <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-2xl shadow-xl border-b-4 border-blue-500">
                        <div>
                            <h2 className="text-3xl font-bold text-[#1e40af]">Perfil bicicletas</h2>
                            <p className="text-gray-500 italic mt-1 text-sm">
                                {bicycles?.length > 0 ? `Bicicleta ${currentIndex + 1} de ${bicycles.length}` : "Sin registros"}
                            </p>
                        </div>
                        <div className="text-4xl">🚲</div>
                    </div>

                    {isLoading && (
                        <div className="flex justify-center items-center h-64">
                            <p className="text-white text-lg animate-pulse font-medium tracking-wide">Cargando bicicletas...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {!isLoading && bicycles?.length === 0 && (
                        <div className="bg-white/10 border border-white/20 p-10 rounded-2xl text-center text-white">
                            <p className="text-xl opacity-80">No tienes bicicletas registradas aún.</p>
                            <button className="mt-4 text-blue-400 hover:underline">Añadir mi primera bicicleta</button>
                        </div>
                    )}

                    {!isLoading && currentBicycle && (
                        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border-l-[10px] border-[#3b82f6]">
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <h3 className="text-2xl font-bold text-gray-800 antialiased tracking-tight">
                                        Detalles de la bicicleta
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <BicycleData label="Marca" value={currentBicycle.brand} icon="🏷️" />
                                    <BicycleData label="Modelo" value={currentBicycle.model} icon="⚙️" />
                                    <BicycleData label="Color" value={currentBicycle.color} icon="🎨" />
                                    <BicycleData label="N° de Serie" value={currentBicycle.serialNumber} icon="🆔" />
                                </div>

                                {bicycles.length > 1 && (
                                    <div className="mt-10 flex flex-col items-center">
                                        <button 
                                            onClick={handleNext} 
                                            className="group flex items-center gap-3 bg-[#272e4b] text-white px-8 py-3 rounded-xl hover:bg-[#323955] transition-all shadow-lg active:scale-95"
                                        >
                                            <span className="font-semibold tracking-wide">Siguiente Bicicleta</span>
                                            <span className="group-hover:translate-x-1 transition-transform">➡️</span>
                                        </button>
                                        <p className="mt-3 text-xs text-gray-400 font-medium">Haz clic para rotar entre tus bicicletas registradas</p>
                                    </div>
                                )}
                            </div>  
                        </div>     
                    )}
                </main>
            </div>
        </div>
    );
};

const BicycleData = ({ label, value, icon }) => (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-hover hover:shadow-md">
        <div className="text-2xl bg-white p-2 rounded-lg shadow-sm">{icon}</div>
        <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-0.5">{label}</p>
            <p className="text-gray-800 font-semibold text-lg antialiased tracking-wide">{value}</p>
        </div>
    </div>
);

export default BicycleProfile;