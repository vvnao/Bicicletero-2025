import axios from './root.service';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
//////////////////////////////////////////////////////////////////////////
export async function getIncidenceFormOptions() {
  try {
    const { data } = await axios.get('/incidences/options');

    if (data.data) {
      return data.data;
    }
    return data;
  } catch (error) {
    throw error;
  }
}
//////////////////////////////////////////////////////////////////////////
export async function getBikerackSpaces(bikerackId) {
  try {
    const { data } = await axios.get(
      `/incidences/bikeracks/${bikerackId}/spaces`
    );
    return data.data.spaces || [];
  } catch (error) {
    throw error;
  }
}
//////////////////////////////////////////////////////////////////////////
export async function searchUserByRut(rut) {
  try {
    const response = await axios.get('/incidences/search-by-rut', {
      params: { rut: rut },
    });

    if (response.data.success && response.data.data) {
      const backendData = response.data.data;

      if (backendData.found === true && backendData.user) {
        return {
          found: true,
          user: backendData.user,
        };
      } else {
        return {
          found: false,
          message: backendData.message || 'Usuario no encontrado',
        };
      }
    } else {
      return {
        found: false,
        message: 'Error en la respuesta del servidor',
      };
    }
  } catch (error) {
    if (error.response) {
      const errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        'Error del servidor';

      return {
        found: false,
        message: `Error: ${errorMessage} (Código: ${error.response.status})`,
      };
    } else if (error.request) {
      return {
        found: false,
        message: 'No se pudo conectar con el servidor',
      };
    } else {
      return {
        found: false,
        message: 'Error al configurar la búsqueda',
      };
    }
  }
}
//////////////////////////////////////////////////////////////////////////
export async function createIncidence(incidenceData) {
  try {
    const { data } = await axios.post('/incidences/report', incidenceData);
    return data.data;
  } catch (error) {
    throw error;
  }
}
//////////////////////////////////////////////////////////////////////////
export async function createIncidenceWithEvidence(
  incidenceData,
  evidenceFiles
) {
  try {
    const formData = new FormData();

    Object.keys(incidenceData).forEach((key) => {
      if (incidenceData[key] !== null && incidenceData[key] !== undefined) {
        formData.append(key, incidenceData[key]);
      }
    });

    if (evidenceFiles && evidenceFiles.length > 0) {
      evidenceFiles.forEach((file, index) => {
        formData.append('evidence', file); 
      });
    }

    const { data } = await axios.post('/incidences/report', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data.data;
  } catch (error) {
    throw error;
  }
}
//////////////////////////////////////////////////////////////////////////
export async function getMyIncidenceReports(filters = {}) {
  try {
    const params = new URLSearchParams();

    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.incidenceType) params.append('type', filters.incidenceType);
    if (filters.severity) params.append('severity', filters.severity);
    if (filters.status) params.append('status', filters.status);

    const url = `/incidences/my-reports${
      params.toString() ? `?${params}` : ''
    }`;
    const { data } = await axios.get(url);

    console.log('🔍 Datos recibidos del backend:', data.data?.[0]?.evidenceUrl);

    return data.data || [];
  } catch (error) {
    throw error;
  }
}
//////////////////////////////////////////////////////////////////////////
export async function getIncidenceDetail(incidenceId) {
  try {
    const { data } = await axios.get(`/incidences/${incidenceId}`);

    if (data.data) {
      const backendBaseUrl = API_URL;
      
      if (data.data.evidences && Array.isArray(data.data.evidences)) {
        data.data.evidences = data.data.evidences.map(evidence => ({
          ...evidence,
          url: evidence.url && evidence.url.startsWith('/') 
            ? `${backendBaseUrl}${evidence.url}`
            : evidence.url
        }));
      }
      
      if (data.data.evidenceUrl) {
        if (data.data.evidenceUrl.startsWith('/')) {
          data.data.evidenceUrl = `${backendBaseUrl}${data.data.evidenceUrl}`;
        }
      }
    }

    return data.data;
  } catch (error) {
    throw error;
  }
}
//////////////////////////////////////////////////////////////////////////
export async function deleteIncidence(incidenceId) {
  try {
    const { data } = await axios.delete(`/incidences/${incidenceId}`);
    return data.data;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error('No tienes permiso para eliminar esta incidencia');
    }
    if (error.response?.status === 404) {
      throw new Error('Incidencia no encontrada');
    }

    throw new Error(
      error.response?.data?.message || 'Error al eliminar incidencia'
    );
  }
}
