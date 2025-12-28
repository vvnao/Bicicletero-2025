"use strict";
import { useState } from "react";
import { createBicycle } from "@services/bicycles.service";

export const useCreateBicycles = (refreshBicycles) => {
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState(null);

    const create = async (data) => {
        setIsCreating(true);
        setCreateError(null);

        try {
            const response = await createBicycle(data);

            if (response && (response.status === "success" || response.data || response.id || response._id)) {
                
                if (refreshBicycles) await refreshBicycles();
                
                setIsCreating(false);
                return { ok: true }; 
            } else {
                const errorMessage = response?.message || "Error al crear bicicleta";
                setCreateError(errorMessage);
                setIsCreating(false);
                return { ok: false, error: errorMessage };
            }
        } catch (error) {
            const msg = "Error de conexión con el servidor";
            setCreateError(msg);
            setIsCreating(false);
            return { ok: false, error: msg };
        }
    };

    return {
        create,
        isCreating,
        createError,
    };
};