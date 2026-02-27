export function calcularDistanciaHaversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distancia = R * c; // Distância em km
  return distancia;
}

export function parseStringToRectangularCoordinates(
  coordString: string
): { latitude: number; longitude: number } | null {
  const parts = coordString.split(",").map((p) => p.trim());

  if (parts.length !== 2) return null;

  const latitude = parseFloat(parts[0]);
  const longitude = parseFloat(parts[1]);

  if (
    isNaN(latitude) ||
    isNaN(longitude || Number(parts[0] || Number(parts[1])))
  )
    return null;

  return { latitude, longitude };
}