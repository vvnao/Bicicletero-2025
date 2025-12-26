"use strict";
import { usePrivateProfile } from "@hooks/profile/usePrivateProfile";

const PrivateProfile = () => {
    const { isLoading, data } = usePrivateProfile();

    return (
        <div className="flex flex-col min-h-screen bg-[#272e4b]">

        <div className="flex flex-1">

            <main className="flex-1 p-8 transition-all duration-300">
            <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-2xl shadow-xl border-b-4 border-blue-500">
                <div>
                <h2 className="text-3xl font-bold text-[#1e40af]">Mi Perfil</h2>
                <p className="text-gray-500 italic mt-1 text-sm">
                    - Gestión de información de usuario -
                </p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                <p className="text-white text-lg animate-pulse">
                    Cargando perfil...
                </p>
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
                        </div>
                    </div>
                <div className="bg-[#323955] p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center border border-slate-600">
                    <div className="w-24 h-24 bg-[#484f6b] rounded-full flex items-center justify-center text-4xl text-white border-4 border-[#3b82f6] shadow-inner mb-4">{data?.names?.charAt(0) || "U"}</div>
                    <h4 className="text-white text-xl font-bold">{data?.names}</h4>
                    <h4 className="text-white text-xl font-bold">{data?.lastName}</h4>
                    <span
                    className={`mt-2 mb-6 px-4 py-1.5 rounded-full text-sm font-bold border${data?.isActive
                            ? "bg-green-100 text-green-700 border-green-300"
                            : "bg-red-100 text-red-700 border-red-300"}`}
                            >{data?.isActive ? "Usuario Activo" : "Usuario Inactivo"}
                    </span>

                    <button disabled={!data?.isActive}
                    className={`w-full py-2 rounded-lg text-sm border transition-colors${data?.isActive
                            ? "bg-white/10 hover:bg-white/20 text-white border-white/20 cursor-pointer"
                            : "bg-gray-600 text-gray-300 border-gray-500 cursor-not-allowed opacity-60"}`}
                    >Editar perfil</button>

                    {!data?.isActive && (
                    <p className="text-red-400 text-xs mt-2 text-center">
                        No puedes editar el perfil mientras el usuario esté inactivo
                    </p>
                    )}
                </div>
                </div>
            )}
            </main>
        </div>
        </div>
    );
};

const DetailField = ({ label, value }) => (
    <div className="flex flex-col">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
        {label}
        </span>
        <span className="text-gray-800 font-medium text-lg truncate">
        {value || "No especificado"}
        </span>
    </div>
);

export default PrivateProfile;
