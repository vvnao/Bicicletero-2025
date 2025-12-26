"use strict"
import Joi from "joi"

export const reservationValidation = Joi.object({
    reservationCode: Joi.string () //* Creo que este tampoco va, ya que es un código que nosotros podemos generar en el sistema
    .min(5)
    .max(10)
    .required()
    .messages({

    }),
    status: Joi.string(),

    //* No necesitamos validaciones en reservas ya que todas las fechas se pueden obtener desde el sistema,
    //* el usuario no debeía ingresar ninguna de las siguientes, el tiempo estimado en el que el usuario
    //* debe llegar es de 30 minutos y el tiempo real es cuando llegue dentro de ese tiempo y si pasa el plazo
    //* ese espacio se libera si es que llega otro usuario.
    /*
    dateTimeReservation: Joi.date(),

    dateTimeEstimatedArrival: Joi.date(),

    dateTimeLimit: Joi.date(),

    dateTimeActualArrival: Joi.date (),

    dateTimeActualDeparture: Joi.date(),

    status: Joi.string(),*/

})