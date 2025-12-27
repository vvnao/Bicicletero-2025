import { AppDataSource } from '../config/configDb.js';
import { UserEntity } from '../entities/UserEntity.js';
import { BicycleEntity } from '../entities/BicycleEntity.js';
import { getSpaceDetailsService } from '../services/spaceDetails.service.js';
import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from '../Handlers/responseHandlers.js';

const userRepository = AppDataSource.getRepository(UserEntity);

export async function getSpaceDetails(req, res) {
  try {
    const { spaceId } = req.params;

    if (!spaceId || isNaN(parseInt(spaceId))) {
      return handleErrorClient(res, 400, 'ID de espacio inválido');
    }

    const spaceData = await getSpaceDetailsService(parseInt(spaceId));

    handleSuccess(
      res,
      200,
      'Datos del espacio obtenidos exitosamente',
      spaceData
    );
  } catch (error) {
    console.error('Error en getSpaceDetails:', error.message);

    if (error.message === 'Espacio no encontrado') {
      return handleErrorClient(res, 404, 'El espacio solicitado no existe');
    }

    handleErrorServer(
      res,
      500,
      'Error interno al procesar los detalles del espacio'
    );
  }
}
//////////////////////////////////////////////////////////////////////////////////////////
export async function getUserByRut(req, res) {
  try {
    const { rut } = req.params;

    if (!rut) {
      return handleErrorClient(res, 400, 'RUT requerido');
    }

    const formatRut = (rutStr) => {
      let cleanRut = rutStr.replace(/[.-]/g, '').toUpperCase();
      if (cleanRut.length < 2) return cleanRut;
      let body = cleanRut.slice(0, -1);
      let dv = cleanRut.slice(-1);
      return `${body}-${dv}`;
    };

    const formattedRut = formatRut(rut);

    const user = await userRepository.findOne({
      where: { rut: formattedRut },
      relations: ['bicycles'],
    });

    if (!user) {
      return handleErrorClient(res, 404, 'Usuario no encontrado');
    }

    const response = {
      id: user.id,
      name: `${user.names} ${user.lastName}`,
      rut: user.rut,
      email: user.email,
      bicycles: user.bicycles.map((bike) => ({
        id: bike.id,
        brand: bike.brand,
        model: bike.model,
        color: bike.color,
        photo: bike.photo,
        serialNumber: bike.serialNumber,
      })),
    };

    handleSuccess(res, 200, 'Usuario encontrado', response);
  } catch (error) {
    console.error('Error en getUserByRut:', error.message);
    handleErrorServer(res, 500, 'Error al buscar usuario');
  }
}
