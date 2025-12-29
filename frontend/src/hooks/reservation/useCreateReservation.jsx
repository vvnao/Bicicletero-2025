"use strict";
import { useState } from "react";
import { createReservation } from "../../services/reservations.service.js";

export const useCreateReservation = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState(null);
    const [reservation, setReservation] = useState(null);

    const create = async ({ bikerackId, bicycleId, estimatedHours }) => {
        setIsCreating(true);
        setError(null);

        try {
        const response = await createReservation(
            bikerackId,
            bicycleId,
            estimatedHours
        );

        if (!response || response.error) {
            throw new Error(response?.message || "Error al crear la reserva");
        }

        setReservation(response.data);
        return response;
        } catch (err) {
        setError(err.message);
        return null;
        } finally {
        setIsCreating(false);
        }
    };

    return {create,reservation,isCreating,error};
};
