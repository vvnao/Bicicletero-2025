"use strict"
import { AppDataSource } from "../config/configDb.js";
import { ReservationEntity } from "../entities/ReservationEntity.js";

export async function getReservation(){

};
export async function createReservation(res, req) {
    try{
        const { body } = req;
        const reservationRepository = AppDataSource.getRepository( ReservationEntity );
        const reservation = reservationRepository.create(body);

        await reservationRepository.save(reservation);



    }catch(error){
        return res.status(500).json({message: 'Error interno del servidor', error: error.message});
    }
};
export async function deleteReservation(res, req){

};