"use strict"
import { useState } from "react";
import NavBar from "@components/NavBar";
import Sidebar from "@components/Sidebar";
import { useGetPrivateBicycles } from "@hooks/bicycles/useGetPrivateBicycles";

const BicycleProfile = () => {
    const { isLoading, bicycles, error } = useGetPrivateBicycles();
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % bicycles.length);
    };
    return (
        <div className="flex flex-col h-screen">
            <NavBar />
            <div className="flex flex-1">
                <Sidebar />
                <main className="p-6 flex-1">
                    <h2 className="text-2xl font-semibold mb-4">Perfil bicicletas</h2>

                    {isLoading && <p>Cargando perfil bicicletas...</p>}
                    {error && <p className="text-red-500">{error}</p>}

                    {!isLoading && bicycles.length === 0 && (
                        <p>No tienes bicicletas registradas.</p>
                    )}

                    {!isLoading && bicycles.length > 0 && (
                        <div className="bg-white p-6 rounded shadow">
                            <p><strong>Marca:</strong> {bicycles[currentIndex].brand}</p>
                            <p><strong>Modelo:</strong> {bicycles[currentIndex].model}</p>
                            <p><strong>Color:</strong> {bicycles[currentIndex].color}</p>
                            <p><strong>N° de serie:</strong> {bicycles[currentIndex].serialNumber}</p>

                            {bicycles.length > 1 && (
                                <button onClick={handleNext} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
                                    Cambiar bicicleta
                                </button>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default BicycleProfile;
