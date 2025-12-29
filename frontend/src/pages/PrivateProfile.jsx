"use strict";
import { useState } from "react";
import { usePrivateProfile } from "../hooks/profile/usePrivateProfile.jsx";
import { useUpdateProfile } from "../hooks/profile/useUpdateProfile.jsx"; 
import Swal from "sweetalert2";

const PrivateProfile = () => {
    const { isLoading, data, refetch } = usePrivateProfile();
    const { execute, loading: isUpdating } = useUpdateProfile();
    
    const [modalConfig, setModalConfig] = useState({ isOpen: false, url: null, title: "" });
    const [localImages, setLocalImages] = useState({
        personalPhoto: null,
        tnePhoto: null
    });

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const isStudent = data?.typePerson === "estudiante";

    const formatUrl = (path) => {
        if (!path) return null;
        return `${API_URL}/${path.replace(/\\/g, "/").replace("src/", "")}`;
    };

    const personalImageUrl = localImages.personalPhoto || (data?.personalPhoto ? formatUrl(data.personalPhoto) : null);
    const tneImageUrl = localImages.tnePhoto || (data?.tnePhoto ? formatUrl(data.tnePhoto) : null);

    //Para las imagenes
    const openModal = (url, title) => setModalConfig({ isOpen: true, url, title });
    const closeModal = () => setModalConfig({ isOpen: false, url: null, title: "" });

    const handleEditClick = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Editar Datos de Perfil',
            background: '#323955',
            color: '#fff',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Guardar Cambios',
            cancelButtonText: 'Cancelar',
            showCancelButton: true,
            html: `
                <div class="flex flex-col gap-4 text-left p-2">
                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-bold text-gray-400">CORREO ELECTRÓNICO</label>
                        <input id="swal-email" class="w-full p-2 rounded bg-[#272e4b] border border-slate-600 text-white" value="${data?.email || ''}">
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-bold text-gray-400">CONTACTO</label>
                        <input id="swal-contact" class="w-full p-2 rounded bg-[#272e4b] border border-slate-600 text-white" value="${data?.contact || ''}">
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-bold text-gray-400">FOTO DE PERFIL</label>
                        <input type="file" id="swal-personalPhoto" class="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" accept="image/*">
                    </div>
                    ${isStudent ? `
                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-bold text-gray-400">FOTO TNE</label>
                        <input type="file" id="swal-tnePhoto" class="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" accept="image/*">
                    </div>` : ''}
                </div>
            `,
            preConfirm: () => {
                return {
                    email: document.getElementById('swal-email').value,
                    contact: document.getElementById('swal-contact').value,
                    personalPhoto: document.getElementById('swal-personalPhoto').files[0],
                    tnePhoto: isStudent ? document.getElementById('swal-tnePhoto').files[0] : null
                };
            }
        });

        if (formValues) {
            Swal.fire({
                title: 'Procesando...',
                text: 'Enviando datos',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const result = await execute(formValues);

            if (result.success) {
                //Para ver los cambios de inmediato al actualizar foto de perfil y tne
                setLocalImages({
                    personalPhoto: formValues.personalPhoto ? URL.createObjectURL(formValues.personalPhoto) : localImages.personalPhoto,
                    tnePhoto: formValues.tnePhoto ? URL.createObjectURL(formValues.tnePhoto) : localImages.tnePhoto
                });

                await Swal.fire({
                    icon: 'success',
                    title: '¡Actualizado!',
                    text: 'Tus datos se han guardado correctamente.',
                    timer: 2000,
                    showConfirmButton: false
                });

                if (refetch) refetch();
            } else {
                Swal.fire('Error', result.error || 'No se pudo actualizar el perfil', 'error');
            }
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#272e4b]">
            <div className="flex flex-1">
                <main className="flex-1 p-8 transition-all duration-300">
                    <h2 className="text-3xl font-bold text-white border-b pb-2 mb-6">Mi Perfil</h2>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <p className="text-white text-lg animate-pulse">Cargando perfil...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/*Datos usuario*/}
                            <div className="lg:col-span-2 bg-[#323955] p-8 rounded-2xl shadow-lg">
                                <h3 className="text-xl font-bold text-white mb-6 border-b pb-2">Datos personales</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                                    <DetailField label="Nombres" value={data?.names} />
                                    <DetailField label="Apellidos" value={data?.lastName} />
                                    <DetailField label="Correo Electrónico" value={data?.email} />
                                    <DetailField label="RUT" value={data?.rut} />
                                    <DetailField label="Contacto" value={data?.contact} />

                                    {isStudent && (
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tarjeta Nacional Estudiantil</span>
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

                            {/*Foto de Perfil*/}
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

                                {personalImageUrl && (
                                    <button
                                        onClick={() => openModal(personalImageUrl, "Foto de Perfil")}
                                        className="w-full mb-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 rounded-lg text-sm font-semibold border border-indigo-500/30 transition-all flex items-center justify-center gap-2"
                                    >
                                        Ver foto de perfil
                                    </button>
                                )}

                                <button
                                    onClick={handleEditClick}
                                    disabled={!data?.isActive || isUpdating}
                                    className={`w-full py-2 rounded-lg text-sm border font-bold transition-colors ${data?.isActive && !isUpdating ? "bg-white text-slate-900 border-white hover:bg-gray-200 cursor-pointer" : "bg-gray-600 text-gray-300 border-gray-500 cursor-not-allowed opacity-60"}`}
                                >
                                    {isUpdating ? 'Guardando...' : 'Editar perfil'}
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/*Para ver las fotos*/}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={closeModal}>
                    <div className="relative max-w-2xl w-full bg-white rounded-2xl p-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <button className="absolute -top-12 right-0 text-white text-lg font-bold hover:text-gray-300 flex items-center gap-2" onClick={closeModal}>
                            Cerrar
                        </button>
                        <img src={modalConfig.url} alt={modalConfig.title} className="w-full h-auto max-h-[75vh] object-contain rounded-xl" />
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
        <span className="text-xs font-bold text-white uppercase tracking-widest mb-1">{label}</span>
        <span className="text-gray-400 font-medium text-lg truncate">{value || "No especificado"}</span>
    </div>
);

export default PrivateProfile;