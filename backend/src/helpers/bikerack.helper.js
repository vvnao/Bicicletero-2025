//! encuentra última vez que algún espacio fue actualizado
export const calculateLastUpdate = (spaces) => {
  if (!spaces || spaces.length === 0) return new Date();
  const spaceUpdates = spaces.map((space) => new Date(space.updated_at));
  return new Date(Math.max(...spaceUpdates));
};

//! formatea la última actualización en texto legible
export const formatLastUpdate = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'hace unos segundos';
  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours} h`;
  return `hace ${Math.floor(diffHours / 24)} días`;
};
