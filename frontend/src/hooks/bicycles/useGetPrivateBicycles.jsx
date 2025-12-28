"use strict";
import { useState, useEffect } from "react";
import { getBicycles } from "../../services/bicycles.service.js";

export const useGetPrivateBicycles = () =>{
    const [bicycles, setBicycles] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBicycles = async () => {
        setLoading(true);
        try {
            const response = await getBicycles();
            const bikes = response?.data;

            if (!bikes) {
                setError("No se pudieron obtener las bicicletas");
                return;
            }
            setBicycles(bikes);
        } catch (error) {
            setError("Error al obtener bicicletas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBicycles();
    }, []);

    return { bicycles, isLoading, error, fetchBicycles };
}