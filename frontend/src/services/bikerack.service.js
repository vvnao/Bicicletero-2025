import axios from './root.service';  

export async function getBikeracks() {
  try {
    const { data } = await axios.get('/bikeracks/dashboard'); 
    return data.data;
  } catch (error) {
    console.error('Error al obtener bicicleteros:', error);
    throw error;
  }
}

export async function getBikerackDetail(id) {
  try {
    const { data } = await axios.get(`/bikeracks/${id}`); 
    return data.data;
  } catch (error) {
    console.error('Error al obtener detalle:', error);
    throw error;
  }
}
