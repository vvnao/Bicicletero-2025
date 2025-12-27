import { useState, useCallback } from "react";
import { updatePrivateProfile } from "@services/profile.service";

export function useUpdateProfile() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const updateProfile = useCallback(async (formData) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await updatePrivateProfile(formData);

            if (response?.error || response?.status === "Client Error") {
                const msg = response?.message || "Error al actualizar perfil";
                setError(msg);
                return null;
            }

            setSuccess(true);
            return response; 
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error inesperado en el servidor";
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        updateProfile,
        isLoading,
        error,
        success,
    };
}