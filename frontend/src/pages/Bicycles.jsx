"use strict";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { useGetPrivateBicycles } from "@hooks/bicycles/useGetPrivateBicycles";
import { useCreateBicycles } from "@hooks/bicycles/useCreateBicycles";
import { useDeleteBicycle } from "@hooks/bicycles/useDeleteBicycles";
import { validateBicycle } from "../utils/bicycleValidation.js";

const Bicycles = () => {
    const { bicycles, isLoading, fetchBicycles } = useGetPrivateBicycles();
    const { create, isCreating } = useCreateBicycles(fetchBicycles);
    const { removeBicycle } = useDeleteBicycle(); 
    
    const [localBicycles, setLocalBicycles] = useState([]);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        if (bicycles) setLocalBicycles(bicycles);
    }, [bicycles]);

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
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <input id="brand" class="swal2-input" placeholder="Marca">
                    <input id="model" class="swal2-input" placeholder="Modelo">
                    <input id="color" class="swal2-input" placeholder="Color">
                    <input id="serial" class="swal2-input" placeholder="Número de serie (solo números)">
                    <label style="text-align: center; margin-top: 10px; font-size: 16px;">Foto de la bicicleta</label>
                    <input type="file" id="photo" class="swal2-file" accept="image/*">
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const data = {
                    brand: document.getElementById("brand").value,
                    model: document.getElementById("model").value,
                    color: document.getElementById("color").value,
                    serialNumber: document.getElementById("serial").value,
                    photo: document.getElementById("photo").files[0],
                };

                const errors = validateBicycle(data);

                if (Object.keys(errors).length > 0) {
                    Swal.showValidationMessage(Object.values(errors)[0]);
                    return false;
                }

                return data;
            },
        });

        if (formValues) {
            const formData = new FormData();
            formData.append("brand", formValues.brand);
            formData.append("model", formValues.model);
            formData.append("color", formValues.color);
            formData.append("serialNumber", formValues.serialNumber);
            if (formValues.photo) formData.append("photo", formValues.photo);

            const result = await create(formData);
            if (result.ok) {
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
                <div className="flex justify-between items-center mb-8 p-6 ">
                    <h2 className="text-4xl font-bold text-white">Mis bicicletas</h2>
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
                                    {localBicycles.length > 0 ? (
                                        localBicycles.map((bike) => {
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
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-10 text-gray-500">No tienes bicicletas registradas.</td>
                                        </tr>
                                    )}
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