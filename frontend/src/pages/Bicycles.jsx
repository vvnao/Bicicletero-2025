"use strict"
import Swal from 'sweetalert2';
import NavBar from "@components/NavBar";
import Sidebar from "@components/Sidebar";
import { useGetPrivateBicycles } from "@hooks/bicycles/useGetPrivateBicycles";
import { useCreateBicycles } from "@hooks/bicycles/useCreateBicycles";

const Bicycles = () => {
    const { bicycles, isLoading, error, fetchBicycles } = useGetPrivateBicycles();

    const { create, isCreating, createError } = useCreateBicycles(fetchBicycles);

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
                brand: document.getElementById('brand').value,
                model: document.getElementById('model').value,
                color: document.getElementById('color').value,
                serialNumber: document.getElementById('serial').value
            })
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
        <div className="flex flex-col h-screen">
            <NavBar />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-8 overflow-y-auto">
                    
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold items-center ">Mis bicicletas</h2>

                        <button 
                            onClick={handleAddBicycles} 
                            className="px-15 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            disabled={isCreating}
                        >
                            {isCreating ? "Guardando..." : "Añadir bicicleta"}
                        </button>
                    </div>

                    {isLoading && <p>Cargando bicicletas...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {isCreating && <p>Guardando bicicleta...</p>}

                    {!isLoading && !error && (
                        <table className="bicycles-table">
                            <thead>
                                <tr>
                                    <th className="text-lg font-semibold">Marca</th>
                                    <th className="text-lg font-semibold">Modelo</th>
                                    <th className="text-lg font-semibold">Color</th>
                                    <th className="text-lg font-semibold">Número de serie</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bicycles.length > 0 ? (
                                    bicycles.map((bike) => (
                                        <tr key={bike.id}>
                                            <td>{bike.brand}</td>
                                            <td>{bike.model}</td>
                                            <td>{bike.color}</td>
                                            <td>{bike.serialNumber}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4">
                                            No tienes bicicletas registradas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </main>
            </div>
        </div>
    );
};
export default Bicycles;