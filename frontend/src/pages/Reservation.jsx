"use strict";
import { useState, useEffect } from "react";
import { getAvailableSpaces, createReservation } from '@services/reservation.service';
import { useGetPrivateBicycles } from "../hooks/bicycles/useGetPrivateBicycles";
import Swal from 'sweetalert2';

//Para manejar cada fila independiente
const BikerackRow = ({ rack, bicycles, onReserved }) => {
    const [selectedBicycle, setSelectedBicycle] = useState("");
    const [hours, setHours] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReserve = async () => {
        if (!selectedBicycle) {
            return Swal.fire("Atención", "Por favor selecciona una de tus bicicletas", "warning");
        }

        setIsSubmitting(true);
        try {
            const result = await createReservation(rack.id, selectedBicycle, hours);

            // Verificamos éxito según el estándar de tu controlador
            if (result.status === "Success" || result.reservationCode) {
                Swal.fire({
                    title: "¡Reserva Confirmada!",
                    html: `
                        <div class="text-left bg-gray-50 p-4 rounded-lg border border-gray-200 mt-2">
                            <p><b>Código:</b> ${result.data?.reservationCode || result.reservationCode}</p>
                            <p><b>Espacio:</b> ${result.data?.spaceCode || result.spaceCode}</p>
                            <p><b>Ubicación:</b> ${rack.name}</p>
                        </div>
                    `,
                    icon: "success"
                });
                onReserved(); // Refresca la tabla principal
            } else {
                Swal.fire("Error", result.message || "No se pudo realizar la reserva", "error");
            }
        } catch (error) {
            Swal.fire("Error", "Error interno al procesar la reserva", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFull = rack.availableSpaces <= 0;

    return (
        <tr className={`border-b border-gray-100 transition-colors ${isFull ? 'bg-gray-50' : 'hover:bg-blue-50/30'}`}>
            <td className="px-6 py-5">
                <div className="font-bold text-gray-800">{rack.name}</div>
                <div className="text-xs text-gray-400 font-normal">Capacidad: {rack.capacity}</div>
            </td>
            <td className="px-6 py-5">
                <div className="flex items-center">
                    <span className={`h-2.5 w-2.5 rounded-full mr-2 ${isFull ? 'bg-red-500' : 'bg-green-500'}`}></span>
                    <span className={`font-semibold ${isFull ? 'text-red-600' : 'text-green-700'}`}>
                        {rack.availableSpaces} disponibles
                    </span>
                </div>
            </td>
            <td className="px-6 py-5 text-sm">
                <select 
                    disabled={isFull}
                    className="w-full border border-gray-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-gray-200"
                    value={selectedBicycle}
                    onChange={(e) => setSelectedBicycle(e.target.value)}
                >
                    <option value="">Elegir bicicleta...</option>
                    {bicycles.map(bike => (
                        <option key={bike.id} value={bike.id}>{bike.brand} - {bike.model}</option>
                    ))}
                </select>
            </td>
            <td className="px-6 py-5">
                <select 
                    disabled={isFull}
                    className="border border-gray-300 rounded-lg p-2 text-sm outline-none bg-white disabled:bg-gray-200"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                >
                    {[...Array(24)].map((_, i) => (
                        <option key={i+1} value={i+1}>{i+1} hr{i > 0 ? 's' : ''}</option>
                    ))}
                </select>
            </td>
            <td className="px-6 py-5 text-center">
                <button 
                    onClick={handleReserve}
                    disabled={isFull || isSubmitting}
                    className={`px-5 py-2 rounded-lg font-bold text-sm text-white transition-all transform shadow-sm
                        ${isFull 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0'}`}
                >
                    {isSubmitting ? '...' : 'Reservar'}
                </button>
            </td>
        </tr>
    );
};
//Página principal
function Reservation() {
    const { bicycles, isLoading: loadingBikes } = useGetPrivateBicycles();
    const [bikeracks, setBikeracks] = useState([]);
    const [loadingRacks, setLoadingRacks] = useState(true);

    const fetchStatus = async () => {
        try {
            const data = await getAvailableSpaces();
            // Aseguramos que data sea un array (en caso de que el service devuelva directo el response.data)
            setBikeracks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error al cargar disponibilidad:", error);
        } finally {
            setLoadingRacks(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    if (loadingRacks || loadingBikes) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mb-4"></div>
                <p className="text-gray-600 font-medium">Sincronizando disponibilidad...</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto animate-fadeIn">
            <header className="mb-10">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Sistema de Reservas</h1>
            </header>
            
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <th className="px-6 py-4">Bicicletero</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Tu Bicicleta</th>
                                <th className="px-6 py-4">Tiempo Estimado</th>
                                <th className="px-6 py-4 text-center">Gestión</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {bikeracks.length > 0 ? (
                                bikeracks.map((rack) => (
                                    <BikerackRow 
                                        key={rack.id} 
                                        rack={rack} 
                                        bicycles={bicycles} 
                                        onReserved={fetchStatus} 
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-400">
                                        No se encontraron bicicleteros disponibles en este momento.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Reservation;