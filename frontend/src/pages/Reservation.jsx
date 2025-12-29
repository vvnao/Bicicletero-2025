"use strict";
import { useState, useEffect } from "react";
import {getAvailableSpaces,createReservation,cancelReservation,getCurrentReservation} from "@services/reservation.service";
import { useGetPrivateBicycles } from "../hooks/bicycles/useGetPrivateBicycles";
import Swal from "sweetalert2";

const BikerackRow = ({rack,bicycles,activeReservation,onReserved,onCancel,}) => {
    const [selectedBicycle, setSelectedBicycle] = useState("");
    const [hours, setHours] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isThisMyReservation =
        activeReservation?.spaceId === rack.id;

    const isPending = activeReservation?.status === "Pendiente";
    const isActive = activeReservation?.status === "Activa";
    const isBlocked = Boolean(activeReservation);

    const isFull = rack.availableSpaces <= 0;

    const handleReserve = async () => {
        if (!selectedBicycle) {
        return Swal.fire("Aviso", "Selecciona una bicicleta", "warning");
        }

        setIsSubmitting(true);
        try {
        const response = await createReservation(
            rack.id,
            selectedBicycle,
            hours
        );

        Swal.fire("¡Éxito!", "Reserva creada correctamente", "success");

        const current = await getCurrentReservation();
        onReserved(current);
        } catch (error) {
        Swal.fire(
            "Error",
            error.message || "No se pudo crear la reserva",
            "error"
        );
        } finally {
        setIsSubmitting(false);
        }
    };

    const handleCancelClick = async () => {
        const confirm = await Swal.fire({
        title: "¿Cancelar reserva?",
        text: "El espacio quedará libre.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Sí, cancelar",
        });

        if (!confirm.isConfirmed) return;

        setIsSubmitting(true);
        try {
        await onCancel(activeReservation.id);
        } finally {
        setIsSubmitting(false);
        }
    };

    return (
        <tr
        className={`border-b border-gray-100 transition-all ${
            isThisMyReservation
            ? "bg-blue-50 border-l-4 border-l-blue-600"
            : ""
        }`}
        >
        <td className="px-6 py-5">
            <div className="font-bold text-gray-800">{rack.name}</div>
            <div className="text-xs text-gray-400">
            Capacidad: {rack.capacity}
            </div>
        </td>

        <td className="px-6 py-5">
            <span
            className={`text-sm font-semibold ${
                isFull ? "text-red-500" : "text-green-600"
            }`}
            >
            {rack.availableSpaces} disponibles
            </span>
        </td>

        <td className="px-6 py-5">
            {!isBlocked ? (
            <select
                disabled={isFull}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
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
            <span className="text-sm italic text-gray-500">
                {isThisMyReservation ? "Bicicleta reservada" : "---"}
            </span>
            )}
        </td>

        <td className="px-6 py-5">
            {!isBlocked && (
            <select
                disabled={isFull}
                className="border border-gray-300 rounded-lg p-2 text-sm"
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
            {isThisMyReservation && isPending && (
            <button
                onClick={handleCancelClick}
                disabled={isSubmitting}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm"
            >
                Cancelar Reserva
            </button>
            )}

            {!isBlocked && (
            <button
                onClick={handleReserve}
                disabled={isFull || isSubmitting}
                className={`px-4 py-2 rounded-lg font-bold text-sm text-white
                ${
                    isFull
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
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

    useEffect(() => {
        const load = async () => {
        try {
            const [spaces, current] = await Promise.all([
            getAvailableSpaces(),
            getCurrentReservation(),
            ]);

            setBikeracks(spaces || []);
            setActiveRes(current);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
        };

        load();
    }, []);

    const onCancelAction = async (reservationId) => {
        await cancelReservation(reservationId);
        setActiveRes(null);

        const spaces = await getAvailableSpaces();
        setBikeracks(spaces || []);

        Swal.fire("Cancelada", "Tu reserva fue eliminada", "info");
    };

    if (loading || loadingBikes) {
        return (
        <div className="p-10 text-center font-bold">
            Cargando sistema de reservas...
        </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">
            Reservas de Bicicleteros
        </h1>

        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
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
                    onCancel={onCancelAction}
                />
                ))}
            </tbody>
            </table>
        </div>

        {activeRes && (
            <div
            className={`mt-8 p-6 rounded-2xl border-2 ${
                activeRes.status === "Pendiente"
                ? "bg-amber-50 border-amber-200"
                : "bg-blue-50 border-blue-200"
            }`}
            >
            <h4 className="font-extrabold text-lg uppercase">
                {activeRes.status === "Pendiente"
                ? "Reserva Pendiente"
                : "Reserva Activa"}
            </h4>

            {activeRes.status === "Pendiente" ? (
                <p className="mt-2">
                Tienes <b>30 minutos</b> para llegar al bicicletero.
                Espacio reservado: <b>{activeRes.spaceCode}</b>
                </p>
            ) : (
                <p className="mt-2">
                Tu reserva está activa. No puedes realizar acciones.
                </p>
            )}
            </div>
        )}
        </div>
    );
}