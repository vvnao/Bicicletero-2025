"use strict";
import { useState, useEffect } from "react";
import { getAvailableSpaces, createReservation, cancelReservation } from '@services/reservation.service';
import { useGetPrivateBicycles } from "../hooks/bicycles/useGetPrivateBicycles";
import Swal from 'sweetalert2';

const BikerackRow = ({ rack, bicycles, activeReservation, onReserved, onCancel }) => {
    const [selectedBicycle, setSelectedBicycle] = useState("");
    const [hours, setHours] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isThisMyReservation = activeReservation?.bikerackId === rack.id || activeReservation?.bikerackName === rack.name;

    const handleReserve = async () => {
        if (!selectedBicycle) return Swal.fire("Aviso", "Selecciona una bicicleta", "warning");
        
        setIsSubmitting(true);
        const response = await createReservation(rack.id, selectedBicycle, hours);
        setIsSubmitting(false);

        if (response.status === "Success" || response.data?.reservationCode) {
            Swal.fire("¡Éxito!", "Reserva creada correctamente", "success");
            onReserved({ 
                ...response.data, 
                bikerackId: rack.id, 
                id: response.data.id || response.reservationId 
            }); 
        } else {
            Swal.fire("Error", response.message, "error");
        }
    };

    const handleCancelClick = async () => {
        const confirm = await Swal.fire({
            title: '¿Cancelar reserva?',
            text: "El espacio quedará libre y el correo de confirmación se invalidará.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Sí, cancelar'
        });

        if (confirm.isConfirmed) {
            setIsSubmitting(true);
            try {
                await onCancel(activeReservation.id);
            } catch (err) {
                Swal.fire("Error", "No se pudo cancelar la reserva", "error");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const isFull = rack.availableSpaces <= 0;

    return (
        <tr className={`border-b border-gray-100 transition-all ${isThisMyReservation ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}>
            <td className="px-6 py-5">
                <div className="font-bold text-gray-800">{rack.name}</div>
                <div className="text-xs text-gray-400">Capacidad: {rack.capacity}</div>
            </td>
            <td className="px-6 py-5">
                <span className={`text-sm font-semibold ${isFull ? 'text-red-500' : 'text-green-600'}`}>
                    {rack.availableSpaces} disponibles
                </span>
            </td>
            <td className="px-6 py-5">
                {!activeReservation ? (
                    <select 
                        disabled={isFull}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={selectedBicycle}
                        onChange={(e) => setSelectedBicycle(e.target.value)}
                    >
                        <option value="">Elegir bicicleta...</option>
                        {bicycles.map(b => (
                            <option key={b.id} value={b.id}>{b.brand} - {b.model}</option>
                        ))}
                    </select>
                ) : (
                    <span className="text-sm italic text-gray-500">
                        {isThisMyReservation ? "Bicicleta reservada" : "---"}
                    </span>
                )}
            </td>
            <td className="px-6 py-5">
                {!activeReservation && (
                    <select 
                        disabled={isFull}
                        className="border border-gray-300 rounded-lg p-2 text-sm"
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                    >
                        {[...Array(24)].map((_, i) => (
                            <option key={i+1} value={i+1}>{i+1} hr{i > 0 ? 's' : ''}</option>
                        ))}
                    </select>
                )}
            </td>
            <td className="px-6 py-5 text-center">
                {isThisMyReservation ? (
                    <button 
                        onClick={handleCancelClick}
                        disabled={isSubmitting}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-all active:scale-95"
                    >
                        {isSubmitting ? '...' : 'Cancelar Reserva'}
                    </button>
                ) : !activeReservation ? (
                    <button 
                        onClick={handleReserve}
                        disabled={isFull || isSubmitting}
                        className={`px-4 py-2 rounded-lg font-bold text-sm text-white shadow-sm transition-all
                            ${isFull ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        Reservar
                    </button>
                ) : null}
            </td>
        </tr>
    );
};

export default function Reservation() {
    const { bicycles, isLoading: loadingBikes } = useGetPrivateBicycles();
    const [bikeracks, setBikeracks] = useState([]);
    const [activeRes, setActiveRes] = useState(null); 
    const [loading, setLoading] = useState(true);

    const refreshData = async () => {
        try {
            const data = await getAvailableSpaces();
            setBikeracks(data || []);
        } catch (error) {
            console.error("Error al refrescar:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const onCancelAction = async (reservationId) => {
        try {
            await cancelReservation(reservationId);
            setActiveRes(null);
            await refreshData(); 
            Swal.fire("Cancelada", "Tu reserva ha sido eliminada exitosamente", "info");
        } catch (error) {
            Swal.fire("Error", error.message || "No se pudo cancelar", "error");
        }
    };

    if (loading || loadingBikes) return <div className="p-10 text-center font-bold">Cargando sistema de reservas...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">Reservas de Bicicleteros</h1>
            
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
                <table className="min-w-full">
                    <thead className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4 text-left">Bicicletero</th>
                            <th className="px-6 py-4 text-left">Estado</th>
                            <th className="px-6 py-4 text-left">Bicicleta</th>
                            <th className="px-6 py-4 text-left">Tiempo</th>
                            <th className="px-6 py-4 text-center">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {bikeracks.map(rack => (
                            <BikerackRow 
                                key={rack.id} 
                                rack={rack} 
                                bicycles={bicycles} 
                                activeReservation={activeRes}
                                onReserved={(data) => { setActiveRes(data); refreshData(); }}
                                onCancel={onCancelAction}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {activeRes && (
                <div className="mt-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-center shadow-sm">
                    <div className="text-4xl mr-5">⏳</div>
                    <div>
                        <h4 className="text-amber-900 font-extrabold text-lg uppercase tracking-tight">¡Reserva Activa!</h4>
                        <p className="text-amber-800 mt-1">
                            Recuerda que tienes un máximo de <b>30 minutos</b> para presentarte en el bicicletero. 
                            Si no registras tu llegada, tu reserva en el espacio <b>{activeRes.spaceCode}</b> será cancelada automáticamente.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}