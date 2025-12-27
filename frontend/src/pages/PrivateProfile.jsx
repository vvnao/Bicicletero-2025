"use strict";
import { useState } from "react"; 
import { usePrivateProfile } from "@hooks/profile/usePrivateProfile";

const PrivateProfile = () => {
    const { isLoading, data } = usePrivateProfile();
    
    const [modalConfig, setModalConfig] = useState({ isOpen: false, url: null, title: "" });

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const isStudent = data?.typePerson === "estudiante";

    const tneImageUrl = data?.tnePhoto
        ? `${API_URL}/${data.tnePhoto.replace(/\\/g, "/").replace("src/", "")}`
        : null;

    const personalImageUrl = data?.personalPhoto
        ? `${API_URL}/${data.personalPhoto.replace(/\\/g, "/").replace("src/", "")}`
        : null;

    const openModal = (url, title) => {
        setModalConfig({ isOpen: true, url, title });
    };

    const closeModal = () => {
        setModalConfig({ isOpen: false, url: null, title: "" });
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#272e4b]">
            <div className="flex flex-1">
                <main className="flex-1 p-8 transition-all duration-300">
                    <h2 className="text-3xl font-bold text-white border-b pb-2 mb-6">
                        Mi Perfil
                    </h2>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <p className="text-white text-lg animate-pulse">Cargando perfil...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border-l-8 border-[#3b82f6]">
                                <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
                                    Datos personales
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                                    <DetailField label="Nombres" value={data?.names} />
                                    <DetailField label="Apellidos" value={data?.lastName} />
                                    <DetailField label="Correo Electrónico" value={data?.email} />
                                    <DetailField label="RUT" value={data?.rut} />
                                    <DetailField label="Contacto" value={data?.contact} />

                                    {isStudent && (
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                                Tarjeta Nacional Estudiantil
                                            </span>
                                            {tneImageUrl ? (
                                                <button
                                                    onClick={() => openModal(tneImageUrl, "Tarjeta Nacional Estudiantil")}
                                                    className="mt-1 flex items-center justify-center w-full md:w-max px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-sm"
                                                >
                                                    Ver foto TNE
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 italic text-sm">No disponible</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/*Perfil de usuario*/}
                            <div className="bg-[#323955] p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center border border-slate-600">
                                <div className="w-24 h-24 rounded-full border-4 border-[#3b82f6] shadow-inner mb-4 overflow-hidden bg-[#484f6b] flex items-center justify-center">
                                    {personalImageUrl ? (
                                        <img src={personalImageUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl text-white font-bold">{data?.names?.charAt(0) || "U"}</span>
                                    )}
                                </div>
                                
                                <h4 className="text-white text-xl font-bold text-center">{data?.names}</h4>
                                <h4 className="text-white text-xl font-bold text-center mb-2">{data?.lastName}</h4>

                                <span className={`mb-6 px-4 py-1.5 rounded-full text-sm font-bold border ${data?.isActive ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-700 border-red-300"}`}>
                                    {data?.isActive ? "Usuario Activo" : "Usuario Inactivo"}
                                </span>

                                {/*Para ver foto de perfil */}
                                {personalImageUrl && (
                                    <button
                                        onClick={() => openModal(personalImageUrl, "Foto de Perfil")}
                                        className="w-full mb-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 rounded-lg text-sm font-semibold border border-indigo-500/30 transition-all flex items-center justify-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Ver foto de perfil
                                    </button>
                                )}

                                <button
                                    disabled={!data?.isActive}
                                    className={`w-full py-2 rounded-lg text-sm border font-bold transition-colors ${data?.isActive ? "bg-white text-slate-900 border-white hover:bg-gray-200 cursor-pointer" : "bg-gray-600 text-gray-300 border-gray-500 cursor-not-allowed opacity-60"}`}
                                >
                                    Editar perfil
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/*Perfil y TNE*/}
            {modalConfig.isOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    onClick={closeModal}
                >
                    <div 
                        className="relative max-w-2xl w-full bg-white rounded-2xl p-2 shadow-2xl animate-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()} //Para que se no se cierre
                    >
                        <button 
                            className="absolute -top-12 right-0 text-white text-lg font-bold hover:text-gray-300 flex items-center gap-2"
                            onClick={closeModal}
                        >
                            Cerrar
                        </button>
                        
                        <img
                            src={modalConfig.url}
                            alt={modalConfig.title}
                            className="w-full h-auto max-h-[75vh] object-contain rounded-xl"
                        />
                        
                        <div className="py-4 text-center">
                            <p className="text-xl font-bold text-gray-800">{modalConfig.title}</p>
                            <p className="text-gray-500 text-sm">{data?.names} {data?.lastName}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DetailField = ({ label, value }) => (
    <div className="flex flex-col">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</span>
        <span className="text-gray-800 font-medium text-lg truncate">{value || "No especificado"}</span>
    </div>
);

export default PrivateProfile;