import axios from './root.service';

export async function getSpaceDetails(id) {
  const { data } = await axios.get(`/space-details/${id}`);
  return data.data;
}

export async function occupyWithReservation(reservationCode) {
  const { data } = await axios.post(
    '/space-management/occupy-with-reservation',
    {
      reservationCode,
    }
  );
  return data;
}

export async function occupyWithoutReservation(id, body) {
  const { data } = await axios.post(
    `/space-management/${id}/occupy-without-reservation`,
    body
  );
  return data;
}

export async function liberateSpace(id, code) {
  const { data } = await axios.patch(`/space-management/${id}/liberate`, {
    retrievalCode: code,
  });

  return data.data || data;
}

export async function getUserByRut(rut) {
  const { data } = await axios.get(`/space-details/user/${rut}`);
  return data.data;
}