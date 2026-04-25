import type LatLng from "../models/LatLng";

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
  return distancia * 1000;
}

export function parseStringToRectangularCoordinates(
  coordString: string
): { latitude: number; longitude: number } | null {
  const parts = coordString.split(",").map((p) => p.trim());

  if (parts.length !== 2) return null;

  const latitude = parseFloat(parts[0]);
  const longitude = parseFloat(parts[1]);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;

  return { latitude, longitude };
}

export function calculateFreeSpaceAtenuation(
  distanceKm: number,
  frequencyGHz: number
): number {
  if (distanceKm <= 0 || frequencyGHz <= 0) {
    throw new Error("Distância e frequência devem ser maiores que zero.");
  }

  const fspl =
    20 * Math.log10(distanceKm * frequencyGHz ) +
    92.45; // constante para km + GHz

  return fspl;
}

export function calculateDiagonalDistance(originPoint: LatLng, destinationPoint: LatLng): number{
  // const horizontalDistance = calcularDistanciaHaversine(originPoint.lat, originPoint.lng, destinationPoint.lat, destinationPoint.lng);
  // const verticalDistance = Math.abs(originPoint.elevation - destinationPoint.elevation)
  // const diagonalDistance = Math.sqrt(Math.pow(horizontalDistance, 2) + Math.pow(verticalDistance, 2))

    const R = 6371000; // metros

    function toRad(graus: number) {
      return graus * (Math.PI / 180);
    }

    const lat1 = toRad(originPoint.lat);
    const lon1 = toRad(originPoint.lng);
    const lat2 = toRad(destinationPoint.lat);
    const lon2 = toRad(destinationPoint.lng);

    const r1 = R + originPoint.elevation;
    const r2 = R + destinationPoint.elevation;

    const x1 = r1 * Math.cos(lat1) * Math.cos(lon1);
    const y1 = r1 * Math.cos(lat1) * Math.sin(lon1);
    const z1 = r1 * Math.sin(lat1);

    const x2 = r2 * Math.cos(lat2) * Math.cos(lon2);
    const y2 = r2 * Math.cos(lat2) * Math.sin(lon2);
    const z2 = r2 * Math.sin(lat2);

    const d = Math.sqrt(
      (x2 - x1) ** 2 +
      (y2 - y1) ** 2 +
      (z2 - z1) ** 2
    );

  return d; // metros




  // return diagonalDistance
}