import { useState } from "react";
import { deleteBicycles } from "../../services/bicycles.service.js";

export const useDeleteBicycle = () => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    const removeBicycle = async (id) => {
        setIsDeleting(true);
        setDeleteError(null);

        try {
            const result = await deleteBicycles(id);
            
            if (result.ok) {
                return { ok: true, data: result.data };
            } else {
                const errorMsg = result.error || "Error al eliminar bicicleta";
                setDeleteError(errorMsg);
                return { ok: false, error: errorMsg };
            }
        } catch (err) {
            const errorMsg = err.message || "Error inesperado al eliminar";
            setDeleteError(errorMsg);
            return { ok: false, error: errorMsg };
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        removeBicycle,
        isDeleting,
        deleteError
    };
};