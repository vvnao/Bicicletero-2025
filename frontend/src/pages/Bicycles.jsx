"use strict";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { useGetPrivateBicycles } from "@hooks/bicycles/useGetPrivateBicycles";
import { useCreateBicycles } from "@hooks/bicycles/useCreateBicycles";

const Bicycles = () => {
    const { bicycles, isLoading, error, fetchBicycles } = useGetPrivateBicycles();
    const { create, isCreating } = useCreateBicycles(fetchBicycles);
    const [localBicycles, setLocalBicycles] = useState([]);

    useEffect(() => {
        if (bicycles) setLocalBicycles(bicycles);
    }, [bicycles]);

    const handleAddBicycles = async () => {
        const { value: formValues } = await Swal.fire({
        title: "Agregar bicicleta",
        html: `
            <input id="brand" class="swal2-input" placeholder="Marca">
            <input id="model" class="swal2-input" placeholder="Modelo">
            <input id="color" class="swal2-input" placeholder="Color">
            <input id="serial" class="swal2-input" placeholder="Número de serie">
            <label class="text-1 font-semibold text-gray-700 mt-4 mb-1 block text-center px-8">Foto de la bicicleta</label>
            <input type="file" id="photo" class="swal2-file" accept="image/*" style="margin-top: 0;">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar",
        preConfirm: () => {
            const brand = document.getElementById("brand").value;
            const model = document.getElementById("model").value;
            const color = document.getElementById("color").value;
            const serialNumber = document.getElementById("serial").value;
            const photo = document.getElementById("photo").files[0];

            if (!brand || !model || !serialNumber) {
            Swal.showValidationMessage("Marca, Modelo y Serie son obligatorios");
            return false;
            }
            return { brand, model, color, serialNumber, photo: photo || null };
        },
        });

        if (formValues) {
        const data = new FormData();
        data.append("brand", formValues.brand);
        data.append("model", formValues.model);
        data.append("color", formValues.color);
        data.append("serialNumber", formValues.serialNumber);
        if (formValues.photo) data.append("photo", formValues.photo);

        const result = await create(data);

        if (result.ok) {
            //Actualiza el estado para mostrar la nueva bicicleta
            setLocalBicycles(prev => [
            ...prev,
            { ...formValues, id: result.data?.id || Date.now() }
            ]);
            Swal.fire("Éxito", "Bicicleta registrada correctamente", "success");
        } else {
            Swal.fire("Error", result.error || "No se pudo crear", "error");
        }
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#272e4b]">
        <div className="flex flex-1">
            <main className="flex-1 p-8">
            <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-2xl shadow-xl border-b-4 border-blue-500">
                <div>
                <h2 className="text-3xl font-bold text-[#1e40af]">Mis bicicletas</h2>
                <p className="text-gray-500 italic mt-1 text-sm">- Gestión de registros -</p>
                </div>
                <button
                onClick={handleAddBicycles}
                disabled={isCreating}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${isCreating ? "bg-gray-300 text-gray-600" : "bg-green-600 hover:bg-green-700 text-white shadow-md"}`}
                >
                {isCreating ? "Guardando..." : "Añadir bicicleta"}
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
                {isLoading && <p className="text-center py-10">Cargando...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}
                {!isLoading && !error && (
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                        <th className="px-4 py-3 text-left">Marca</th>
                        <th className="px-4 py-3 text-left">Modelo</th>
                        <th className="px-4 py-3 text-left">Color</th>
                        <th className="px-4 py-3 text-left">N° Serie</th>
                        <th className="px-4 py-3 text-left">Opciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {localBicycles.map((bike, index) => (
                        <tr key={bike?.id || bike?._id || index} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3">{bike?.brand}</td>
                            <td className="px-4 py-3">{bike?.model}</td>
                            <td className="px-4 py-3">{bike?.color}</td>
                            <td className="px-4 py-3">{bike?.serialNumber}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                )}
            </div>
            </main>
        </div>
        </div>
    );
};

export default Bicycles;