"use strict";
import NavBar from "@components/NavBar";
import Sidebar from "@components/Sidebar";
import { usePrivateProfile } from "@hooks/profile/usePrivateProfile";

const PrivateProfile = () => {
    const { isLoading, data } = usePrivateProfile();

    return (
        <div className="flex flex-col h-screen">
            <NavBar />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-6">
                    <h2 className="text-2xl font-semibold mb-4">Mi Perfil</h2>
                    {isLoading && <p>Cargando perfil...</p>}
                    {!isLoading && data && (
                        <div className="bg-white p-6 rounded shadow">
                            <p><strong>Nombre:</strong> {data.names}</p>
                            <p><strong>Apellido:</strong> {data.lastName}</p>
                            <p><strong>Correo:</strong> {data.email}</p>
                            <p><strong>Rol:</strong> {data.role}</p>
                            <p><strong>Rut:</strong>{data.rut}</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default PrivateProfile;
