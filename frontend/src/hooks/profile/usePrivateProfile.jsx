"use strict";
import { useState, useEffect } from "react";
import { getPrivateProfile } from "../../services/profile.service.js";

export const usePrivateProfile = () => {
    const [data, setData] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await getPrivateProfile();
            const user = response?.data?.userData;

            if (!user) {
                setError("No se encontraron datos del usuario");
                return;
            }
            setData(user);

        } catch (error) {
            setError("Error al obtener perfil");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);
    
    return { data, isLoading, error };
};