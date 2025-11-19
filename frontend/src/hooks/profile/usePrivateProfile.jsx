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
            if (!response?.data?.user) {
                setError("No se encontraron datos del usuario");
                return;
            }
            setData(response.data.user);
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