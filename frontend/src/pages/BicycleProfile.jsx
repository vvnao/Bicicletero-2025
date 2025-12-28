"use strict";
import { useState, useEffect } from "react"; // Añadido useEffect
import { FiTag, FiSettings, FiDroplet, FiHash, FiUser, FiEdit3, FiChevronRight } from "react-icons/fi";
import { useGetPrivateBicycles } from "@hooks/bicycles/useGetPrivateBicycles";
import { useUpdateBicycles } from "@hooks/bicycles/useUpdateBicycles";
import Swal from "sweetalert2";

const BicycleProfile = () => {
    const { isLoading, bicycles, refetch } = useGetPrivateBicycles();
    const { execute: updateBicycle, loading: isUpdating } = useUpdateBicycles();
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showZoomModal, setShowZoomModal] = useState(false);
    const [localImages, setLocalImages] = useState({});

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const currentBicycle = bicycles ? bicycles[currentIndex] : null;

    useEffect(() => {
        if (bicycles) {
            console.log("Lista de Bicicletas get:", bicycles);
            if (bicycles[currentIndex]) {
                console.log("Foto de la bici actual en DB:", bicycles[currentIndex].photo);
            }
        }
    }, [bicycles, currentIndex]);

    const formatUrl = (path) => {
        if (!path) return null;
        const formatted = `${API_URL}/${path.replace(/\\/g, "/").replace("src/", "")}`;
        console.log("url formateada para mostrar:", formatted);
        return formatted;
    };

    const bicycleImageUrl = (currentBicycle && localImages[currentBicycle.id]) 
        ? localImages[currentBicycle.id] 
        : (currentBicycle?.photo ? formatUrl(currentBicycle.photo) : null);

    const handleEditClick = async () => {
        if (!currentBicycle) return;

        const { value: formValues } = await Swal.fire({
            title: 'Editar Bicicleta',
            background: '#272e4b',
            color: '#fff',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Guardar Cambios',
            cancelButtonText: 'Cancelar',
            showCancelButton: true,
            html: `
                <div class="flex flex-col gap-4 text-left p-2">
                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-bold text-gray-400">COLOR PRIMARIO</label>
                        <input id="swal-color" class="w-full p-2 rounded bg-[#1a1f37] border border-slate-600 text-white" value="${currentBicycle.color || ''}">
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-bold text-gray-400">FOTO DE LA BICICLETA</label>
                        <input type="file" id="swal-photo" class="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" accept="image/*">
                    </div>
                </div>
            `,
            preConfirm: () => {
                return {
                    color: document.getElementById('swal-color').value,
                    photo: document.getElementById('swal-photo').files[0]
                };
            }
        });

        if (formValues) {
            Swal.fire({
                title: 'Actualizando...',
                text: 'Enviando datos',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const result = await updateBicycle(currentBicycle.id, formValues);
            console.log("Respuesta del Servidor update:", result);

            if (result.success) {
                if (formValues.photo) {
                    const objectUrl = URL.createObjectURL(formValues.photo);
                    console.log("Generada url local temporal:", objectUrl);
                    setLocalImages(prev => ({
                        ...prev,
                        [currentBicycle.id]: objectUrl
                    }));
                }

                await Swal.fire({
                    icon: 'success',
                    title: '¡Actualizado!',
                    text: 'Los datos se han guardado correctamente.',
                    timer: 2000,
                    showConfirmButton: false
                });

                if (refetch) {
                    await refetch();
                }
            } else {
                console.error("Error al actualizar:", result.error);
                Swal.fire('Error', result.error || 'No se pudo actualizar', 'error');
            }
        }
    };

    return (
        <div className="min-h-screen bg-blue p-4 md:p-10 text-white font-sans">
            {showZoomModal && bicycleImageUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setShowZoomModal(false)}>
                    <img src={bicycleImageUrl} className="max-w-full max-h-full rounded-xl object-contain animate-in zoom-in duration-300" />
                </div>
            )}

            {!isLoading && currentBicycle ? (
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[#272e4b]/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/10 p-8 flex flex-col items-center">
                            <div className="w-48 h-48 rounded-full border-4 border-[#3b82f6]/30 overflow-hidden bg-[#1a1f37] mb-6 shadow-xl">
                                {bicycleImageUrl ? (
                                    <img src={bicycleImageUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-white/10"><FiSettings size={60} /></div>
                                )}
                            </div>
                            <h2 className="text-3xl font-bold text-center">{currentBicycle.brand}</h2>
                            <p className="text-[#3b82f6] text-sm font-bold uppercase tracking-widest mt-1 mb-8">{currentBicycle.model}</p>
                            
                            <div className="w-full space-y-3">
                                <button onClick={() => setShowZoomModal(true)} className="w-full py-3 bg-[#3b82f6] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#2563eb] transition-all">
                                    <FiUser /> Ver Foto
                                </button>
                                <button onClick={handleEditClick} disabled={isUpdating} className="w-full py-3 bg-white/5 border border-white/10 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                                    <FiEdit3 /> {isUpdating ? 'Guardando...' : 'Editar Bicicleta'}
                                </button>
                            </div>
                        </div>

                        {bicycles.length > 1 && (
                            <div className="bg-[#272e4b]/40 rounded-2xl p-6 flex justify-between items-center border border-white/10 shadow-xl">
                                <div>
                                    <p className="text-[10px] uppercase text-white/50 font-bold tracking-tighter">Bicicleta actual</p>
                                    <p className="font-bold text-lg">{currentIndex + 1} / {bicycles.length}</p>
                                </div>
                                <button onClick={() => setCurrentIndex((prev) => (prev + 1) % bicycles.length)} className="p-3 bg-[#3b82f6]/20 text-[#3b82f6] rounded-xl hover:bg-[#3b82f6]/40 transition-all">
                                    <FiChevronRight size={24} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-8">
                        <div className="bg-[#272e4b]/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/10 h-full p-10">
                            <h3 className="text-2xl font-bold mb-10 pb-4 border-b border-white/5">Perfil Bicicleta</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-6">
                                <InfoItem label="Marca" value={currentBicycle.brand} icon={<FiTag />} />
                                <InfoItem label="Modelo" value={currentBicycle.model} icon={<FiSettings />} />
                                <InfoItem label="Color" value={currentBicycle.color} icon={<FiDroplet />} />
                                <InfoItem label="N° Serie" value={currentBicycle.serialNumber} icon={<FiHash />} />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex justify-center items-center h-64"><p className="animate-pulse">Cargando...</p></div>
            )}
        </div>
    );
};

const InfoItem = ({ label, value, icon }) => (
    <div className="flex items-center gap-5">
        <div className="p-4 bg-white/5 rounded-2xl text-[#3b82f6] border border-white/10">{icon}</div>
        <div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{label}</p>
            <p className="text-white font-bold text-xl tracking-tight">{value || "---"}</p>
        </div>
    </div>
);

export default BicycleProfile;