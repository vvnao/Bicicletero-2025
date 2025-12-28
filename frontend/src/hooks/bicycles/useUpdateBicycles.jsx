import { useState } from 'react';
import { updateBicycles } from '../../services/bicycles.service.js';

export function useUpdateBicycles() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = async (id, formValues) => {
        setLoading(true);
        setError(null);

        try {
            const result = await updateBicycles(id, formValues);

            setLoading(false);
            return { success: true, data: result };
        } catch (err) {
            setLoading(false);
            
            const errMsg = err.message || 'Error de conexión con el servidor';
            setError(errMsg);
            
            return { success: false, error: errMsg };
        }
    };

    return { execute, loading, error };
}