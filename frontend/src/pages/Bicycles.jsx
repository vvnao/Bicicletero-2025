"use strict";
import Swal from "sweetalert2";
import NavBar from "@components/NavBar";
import Sidebar from "@components/Sidebar";
import { useGetPrivateBicycles } from "@hooks/bicycles/useGetPrivateBicycles";
import { useCreateBicycles } from "@hooks/bicycles/useCreateBicycles";

const Bicycles = () => {
    const { bicycles, isLoading, error, fetchBicycles } =
        useGetPrivateBicycles();

    const { create, isCreating, createError } =
        useCreateBicycles(fetchBicycles);

    const handleAddBicycles = async () => {
        const { value: formValues } = await Swal.fire({
        title: "Agregar bicicleta",
        html: `
            <input id="brand" class="swal2-input" placeholder="Marca">
            <input id="model" class="swal2-input" placeholder="Modelo">
            <input id="color" class="swal2-input" placeholder="Color">
            <input id="serial" class="swal2-input" placeholder="Número de serie">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Guardar",
        preConfirm: () => ({
            brand: document.getElementById("brand").value,
            model: document.getElementById("model").value,
            color: document.getElementById("color").value,
            serialNumber: document.getElementById("serial").value,
        }),
        });

        if (formValues) {
        const ok = await create(formValues);

        if (ok) {
            Swal.fire("Éxito", "Bicicleta agregada", "success");
        } else {
            Swal.fire("Error", createError, "error");
        }
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#272e4b]">
        <NavBar />

        <div className="flex flex-1">
            <Sidebar />

            <main className="flex-1 p-8 transition-all duration-300">
            <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-2xl shadow-xl border-b-4 border-blue-500">
                <div>
                <h2 className="text-3xl font-bold text-[#1e40af]">
                    Mis bicicletas
                </h2>
                <p className="text-gray-500 italic mt-1 text-sm">
                    - Gestión de bicicletas registradas -
                </p>
                </div>

                <button
                onClick={handleAddBicycles}
                disabled={isCreating}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors
                    ${
                    isCreating
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }
                `}
                >
                {isCreating ? "Guardando..." : "Añadir bicicleta"}
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
                {isLoading && (
                <p className="text-center text-gray-500 animate-pulse">
                    Cargando bicicletas...
                </p>
                )}

                {error && (
                <p className="text-center text-red-500 font-medium">
                    {error}
                </p>
                )}

                {!isLoading && !error && (
                <>
                    {bicycles.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Marca
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Modelo
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Color
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        N° Serie
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                        Opciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {bicycles.map((bike) => (
                                <tr key={bike.id}className="border-t hover:bg-gray-50 transition">
                                    <td className="px-4 py-3">
                                    {bike.brand}
                                    </td>
                                    <td className="px-4 py-3">
                                    {bike.model}
                                    </td>
                                    <td className="px-4 py-3">
                                    {bike.color}
                                    </td>
                                    <td className="px-4 py-3">
                                    {bike.serialNumber}
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    ) : (
                    <div className="text-center py-10 text-gray-500">
                        No tienes bicicletas registradas 🚲
                    </div>
                    )}
                </>
                )}
            </div>
            </main>
        </div>
        </div>
    );
};

export default Bicycles;