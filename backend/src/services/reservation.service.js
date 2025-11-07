"use strict"
import { AppDataSource } from "../config/configDb";
import { ReservationEntity } from "../entities/ReservationEntity";

export async function reservation (){
    try{
        const reservationRepository = AppDataSource.getRepository(ReservationEntity);
        const reservacion = await getReservation();
    }catch(error){
        return res.status(500).json({ message: error.mensaje||'Error interno del servidor'});
    }
}