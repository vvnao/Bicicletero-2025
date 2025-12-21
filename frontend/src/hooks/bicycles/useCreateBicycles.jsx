"use strict";
import { useState } from "react";
import { createBicycle } from "@services/bicycles.service";

export const useCreateBicycles = (refreshBicycles) => {
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState(null);

    const create = async (data) => {
        setIsCreating(true);
        setCreateError(null);

        const response = await createBicycle(data);

        if (response?.status !== "success") {
            setCreateError(response.message || "Error al crear bicicleta");
            setIsCreating(false);
            return false;
        }

        if (refreshBicycles) refreshBicycles();

        setIsCreating(false);
        return true;
    };

    return {
        create,
        isCreating,
        createError,
    };
};
