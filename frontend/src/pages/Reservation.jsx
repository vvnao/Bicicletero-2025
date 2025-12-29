"use strict";
import { useState, useEffect } from "react";
import { getAvailableSpaces, createReservation, cancelReservation, getCurrentReservation } from "@services/reservation.service";
import { useGetPrivateBicycles } from "../hooks/bicycles/useGetPrivateBicycles";
import Swal from "sweetalert2";

const BikerackRow = ({ rack, bicycles, activeReservation, onReserved }) => {
    const [selectedBicycle, setSelectedBicycle] = useState("");
    const [hours, setHours] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isThisMyReservation = activeReservation?.spaceId === rack.id;
    const hasAnyActiveRes = Boolean(activeReservation);
    const isFull = rack.availableSpaces <= 0;

    const handleReserve = async () => {
        if (!selectedBicycle) {
            return Swal.fire("Aviso", "Selecciona una bicicleta", "warning");
        }

        setIsSubmitting(true);
        try {
            await createReservation(rack.id, selectedBicycle, hours);
            Swal.fire("¡Éxito!", "Reserva creada correctamente", "success");
            const current = await getCurrentReservation();
            onReserved(current);
        } catch (error) {
            Swal.fire("Error", error.message || "No se pudo crear la reserva", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <tr className={`border-b border-gray-100 ${isThisMyReservation ? "bg-blue-50" : ""}`}>
            <td className="px-6 py-5">
                <div className="font-bold text-gray-800">{rack.name}</div>
                <div className="text-xs text-gray-400">Capacidad: {rack.capacity}</div>
            </td>

            <td className="px-6 py-5">
                <span className={`text-sm font-semibold ${isFull ? "text-red-500" : "text-green-600"}`}>
                    {rack.availableSpaces} disponibles
                </span>
            </td>

            <td className="px-6 py-5">
                {!isThisMyReservation ? (
                    <select
                        disabled={isFull || hasAnyActiveRes}
                        className="w-full border rounded-lg p-2 text-sm"
                        value={selectedBicycle}
                        onChange={(e) => setSelectedBicycle(e.target.value)}
                    >
                        <option value="">Elegir bicicleta...</option>
                        {bicycles.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.brand} - {b.model}
                            </option>
                        ))}
                    </select>
                ) : (
                    <span className="text-sm font-medium text-blue-700 italic">
                        Bicicleta en uso
                    </span>
                )}
            </td>

            <td className="px-6 py-5">
                {!isThisMyReservation && (
                    <select
                        disabled={isFull || hasAnyActiveRes}
                        className="border rounded-lg p-2 text-sm"
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                    >
                        {[...Array(24)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {i + 1} hrs
                            </option>
                        ))}
                    </select>
                )}
            </td>

            <td className="px-6 py-5 text-center">
                {!isThisMyReservation && (
                    <button
                        onClick={handleReserve}
                        disabled={isFull || isSubmitting || hasAnyActiveRes}
                        className={`px-4 py-2 rounded-lg font-bold text-sm text-white
                        ${(isFull || hasAnyActiveRes)
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                        Reservar
                    </button>
                )}
            </td>
        </tr>
    );
};

export default function Reservation() {
    const { bicycles, isLoading: loadingBikes } = useGetPrivateBicycles();
    const [bikeracks, setBikeracks] = useState([]);
    const [activeRes, setActiveRes] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [spaces, current] = await Promise.all([
                getAvailableSpaces(),
                getCurrentReservation(),
            ]);
            setBikeracks(spaces || []);
            setActiveRes(current);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCancelReservation = async () => {
        const confirm = await Swal.fire({
            title: "¿Cancelar reserva?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Cancelar",
            confirmButtonColor: "#ef4444",
        });

        if (!confirm.isConfirmed) return;

        try {
            await cancelReservation(activeRes.id);
            setActiveRes(null);
            setBikeracks(await getAvailableSpaces());
            Swal.fire("Cancelada", "Reserva cancelada", "info");
        } catch {
            Swal.fire("Error", "No se pudo cancelar", "error");
        }
    };

    if (loading || loadingBikes) return null;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-white">
                    Reservas de Bicicleteros
                </h1>

                {activeRes?.status === "Pendiente" && (
                    <button
                        onClick={handleCancelReservation}
                        className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-bold"
                    >
                        Cancelar reserva
                    </button>
                )}
            </div>

            {/* MENSAJE ESTÁTICO */}
            {activeRes?.status === "Pendiente" && (
    <div className="mb-6 bg-amber-100 border border-amber-300 text-amber-800 px-4 py-3 rounded-lg text-sm font-medium">
        Tienes una reserva pendiente para tu bicicleta:{" "}
        <strong>
            {activeRes?.bicycle?.brand} {activeRes?.bicycle?.model}
        </strong>
    </div>
)}

            {/* TABLA */}
            <div className="bg-white shadow rounded-2xl overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50 text-gray-400 text-xs font-bold uppercase">
                        <tr>
                            <th className="px-6 py-4 text-left">Bicicletero</th>
                            <th className="px-6 py-4 text-left">Estado</th>
                            <th className="px-6 py-4 text-left">Bicicleta</th>
                            <th className="px-6 py-4 text-left">Tiempo</th>
                            <th className="px-6 py-4 text-center">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bikeracks.map((rack) => (
                            <BikerackRow
                                key={rack.id}
                                rack={rack}
                                bicycles={bicycles}
                                activeReservation={activeRes}
                                onReserved={setActiveRes}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}