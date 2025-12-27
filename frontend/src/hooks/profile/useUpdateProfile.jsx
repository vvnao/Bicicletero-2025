import { useState } from 'react';
import { updatePrivateProfile } from '../../services/profile.service.js';

export function useUpdateProfile() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = async (formValues) => {
        setLoading(true);
        setError(null);

        try {
            const result = await updatePrivateProfile(formValues);

            if (result.status === 'error' || result.message?.toLowerCase().includes('error')) {
                const msg = result.message || 'Error al actualizar';
                setError(msg);
                setLoading(false);
                return { success: false, error: msg };
            }

            setLoading(false);
            return { success: true, data: result };
        } catch (err) {
            setLoading(false);
            const errMsg = 'Error de conexión con el servidor';
            setError(errMsg);
            return { success: false, error: errMsg };
        }
    };

    return { execute, loading, error };
}