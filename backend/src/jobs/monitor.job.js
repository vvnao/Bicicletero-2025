import { checkTimeExceededSpaces } from '../services/spaceManagement.service.js';
import { expireOldReservations } from '../services/reservation.service.js';

export function startMonitoringJobs() {
  console.log('--> Iniciando jobs de monitoreo automático...');

  setInterval(async () => {
    try {
      const updated = await checkTimeExceededSpaces();
      if (updated > 0)
        console.log(`${updated} infracciones detectadas y notificadas.`);
    } catch (error) {
      console.error('Error en job de infracciones:', error);
    }
  }, 60000);

  setTimeout(() => {
    setInterval(async () => {
      try {
        const expired = await expireOldReservations();
        if (expired > 0) console.log(`--> ${expired} reservas expiradas.`);
      } catch (error) {
        console.error('Error en job de expiración:', error);
      }
    }, 60000);
  }, 30000);
}
