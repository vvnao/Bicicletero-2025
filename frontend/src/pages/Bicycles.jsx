"use strict";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { useGetPrivateBicycles } from "@hooks/bicycles/useGetPrivateBicycles";
import { useCreateBicycles } from "@hooks/bicycles/useCreateBicycles";
import { useDeleteBicycle } from "@hooks/bicycles/useDeleteBicycles";

const Bicycles = () => {
    const { bicycles, isLoading, error, fetchBicycles } = useGetPrivateBicycles();
    const { create, isCreating } = useCreateBicycles(fetchBicycles);
    const { removeBicycle, isDeleting } = useDeleteBicycle(); 
    
    const [localBicycles, setLocalBicycles] = useState([]);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        if (bicycles) setLocalBicycles(bicycles);
    }, [bicycles]);

    // Función para manejar el borrado
    const handleDeleteBike = async (bike) => {
        const id = bike?._id || bike?.id;
        
        const confirm = await Swal.fire({
            title: "¿Eliminar bicicleta?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        });

        if (confirm.isConfirmed) {
            setDeletingId(id);
            const result = await removeBicycle(id);
            setDeletingId(null);

            if (result.ok) {
                setLocalBicycles(prev => prev.filter(b => (b._id || b.id) !== id));
                Swal.fire("Eliminado", "La bicicleta ha sido borrada.", "success");
            } else {
                Swal.fire("Error", result.error || "No se pudo eliminar", "error");
            }
        }
    };

    const handleAddBicycles = async () => {
        const { value: formValues } = await Swal.fire({
            title: "Agregar bicicleta",
            html: `
                <input id="brand" class="swal2-input" placeholder="Marca">
                <input id="model" class="swal2-input" placeholder="Modelo">
                <input id="color" class="swal2-input" placeholder="Color">
                <input id="serial" class="swal2-input" placeholder="Número de serie">
                <input type="file" id="photo" class="swal2-file" accept="image/*">
            `,
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                const brand = document.getElementById("brand").value;
                const model = document.getElementById("model").value;
                const serialNumber = document.getElementById("serial").value;
                if (!brand || !model || !serialNumber) {
                    Swal.showValidationMessage("Marca, Modelo y Serie son obligatorios");
                    return false;
                }
                return { 
                    brand, model, 
                    color: document.getElementById("color").value, 
                    serialNumber, 
                    photo: document.getElementById("photo").files[0] 
                };
            },
        });

        if (formValues) {
            const data = new FormData();
            Object.keys(formValues).forEach(key => {
                if (formValues[key]) data.append(key, formValues[key]);
            });

            const result = await create(data);
            if (result.ok) {
                // Sincronizamos con el servidor para obtener el objeto completo con su ID real
                fetchBicycles();
                Swal.fire("Éxito", "Bicicleta registrada correctamente", "success");
            } else {
                Swal.fire("Error", result.error || "No se pudo crear", "error");
            }
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#272e4b] p-8">
            <div className="max-w-6xl mx-auto w-full">
                <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-2xl shadow-xl">
                    <h2 className="text-3xl font-bold text-[#1e40af]">Mis bicicletas</h2>
                    <button
                        onClick={handleAddBicycles}
                        disabled={isCreating}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-all disabled:bg-gray-400"
                    >
                        {isCreating ? "Guardando..." : "Añadir bicicleta"}
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                    {isLoading ? (
                        <p className="text-center py-10">Cargando...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Marca</th>
                                        <th className="px-4 py-3 text-left">Modelo</th>
                                        <th className="px-4 py-3 text-left">Color</th>
                                        <th className="px-4 py-3 text-left">N° Serie</th>
                                        <th className="px-4 py-3 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {localBicycles.map((bike) => {
                                        const id = bike._id || bike.id;
                                        return (
                                            <tr key={id} className="border-t hover:bg-gray-50">
                                                <td className="px-4 py-3">{bike.brand}</td>
                                                <td className="px-4 py-3">{bike.model}</td>
                                                <td className="px-4 py-3">{bike.color || "-"}</td>
                                                <td className="px-4 py-3">{bike.serialNumber}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button 
                                                        onClick={() => handleDeleteBike(bike)}
                                                        disabled={deletingId === id}
                                                        className="text-red-600 hover:text-red-800 font-medium disabled:text-gray-400"
                                                    >
                                                        {deletingId === id ? "Eliminando..." : "Eliminar"}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Bicycles;