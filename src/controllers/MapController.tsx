import { useEffect, useState } from "react"
import type LatLng from "../models/LatLng"
import type MapControllerInterface from "../models/MapControllerInterface"
import type AzimuthInterface from "../models/Azimith"
import { calcularDistanciaHaversine } from "../helpers/helper"

export default function MapController(): MapControllerInterface {
  const [originPoint, setOriginalPoint] =  useState<LatLng>({lat:0, lng: 0, elevation: 0})
  const [destinationPoint, setDestinationPoint] =  useState<LatLng>({lat: 0, lng: 0, elevation: 0})
  const [elevationPath, setElevationPath] = useState<LatLng[]>([])
  const [distanceInMeters, setDistanceInMeters] = useState<number>(0)
  const [sightLine, setSightLine] = useState<LatLng[]>([]) // linha de visada
  const [topFresnelElipsoid, setTopFresnelElipsoid] = useState<LatLng[]>([])
  const [bottomFresnelElipsoid, setBottomFresnelElipsoid] = useState<LatLng[]>([])

  const [maxInterferencePoint, setMaxInterferencePoint] = useState<LatLng>({elevation: 0, lat: 0, lng: 0})
  const [maxInterferencePointDistance, setMaxInterferencePointDistance] = useState<number>(0)
  const [azimuthInDegrees, setAzimuthInDegrees] = useState<AzimuthInterface>({normal: 0, inverse: 0})

  function calculateAzimuthInDegrees (): void {
  if(originPoint.lat === 0 || destinationPoint.lat === 0) return
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const φ1 = toRad(originPoint.lat);
  const φ2 = toRad(destinationPoint.lat);
  const Δλ = toRad(destinationPoint.lng - originPoint.lng);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  const azimuth = (toDeg(θ) + 360) % 360;
  setAzimuthInDegrees({normal: azimuth, inverse: azimuth <= 180 ? azimuth + 180 : azimuth -180})
  }

  function generateSightLine(){
    if(originPoint.lat === 0 || destinationPoint.lat === 0) return
    const points: LatLng[] = [];

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const lat1 = toRad(originPoint.lat);
    const lon1 = toRad(originPoint.lng);
    const lat2 = toRad(destinationPoint.lat);
    const lon2 = toRad(destinationPoint.lng);

    const d =
      2 *
      Math.asin(
        Math.sqrt(
          Math.sin((lat2 - lat1) / 2) ** 2 +
            Math.cos(lat1) *
              Math.cos(lat2) *
              Math.sin((lon2 - lon1) / 2) ** 2
        )
      );

    // Se os pontos forem idênticos
    if (d === 0) {
      return Array.from({ length: elevationPath.length }, () => originPoint);
    }

    for (let i = 0; i < elevationPath.length; i++) {

      // Aqui está a correção:
      // usamos (elevationPath.length - 1)
      const f = i / (elevationPath.length - 1);

      const A = Math.sin((1 - f) * d) / Math.sin(d);
      const B = Math.sin(f * d) / Math.sin(d);

      const x =
        A * Math.cos(lat1) * Math.cos(lon1) +
        B * Math.cos(lat2) * Math.cos(lon2);

      const y =
        A * Math.cos(lat1) * Math.sin(lon1) +
        B * Math.cos(lat2) * Math.sin(lon2);

      const z = A * Math.sin(lat1) + B * Math.sin(lat2);

      const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)));
      const lng = toDeg(Math.atan2(y, x));

      const elevation =
        originPoint.elevation +
        (destinationPoint.elevation - originPoint.elevation) * f;

      points.push({ lat, lng, elevation });
    }
    setSightLine(points)
  }

    function generateSightLineWithParams(originPoint: LatLng, destinationPoint: LatLng): LatLng[]{
    if(originPoint.lat === 0 || destinationPoint.lat === 0) return []
    const points: LatLng[] = [];

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const lat1 = toRad(originPoint.lat);
    const lon1 = toRad(originPoint.lng);
    const lat2 = toRad(destinationPoint.lat);
    const lon2 = toRad(destinationPoint.lng);

    const d =
      2 *
      Math.asin(
        Math.sqrt(
          Math.sin((lat2 - lat1) / 2) ** 2 +
            Math.cos(lat1) *
              Math.cos(lat2) *
              Math.sin((lon2 - lon1) / 2) ** 2
        )
      );

    // Se os pontos forem idênticos
    if (d === 0) {
      return Array.from({ length: elevationPath.length }, () => originPoint);
    }

    for (let i = 0; i < elevationPath.length; i++) {

      // Aqui está a correção:
      // usamos (elevationPath.length - 1)
      const f = i / (elevationPath.length - 1);

      const A = Math.sin((1 - f) * d) / Math.sin(d);
      const B = Math.sin(f * d) / Math.sin(d);

      const x =
        A * Math.cos(lat1) * Math.cos(lon1) +
        B * Math.cos(lat2) * Math.cos(lon2);

      const y =
        A * Math.cos(lat1) * Math.sin(lon1) +
        B * Math.cos(lat2) * Math.sin(lon2);

      const z = A * Math.sin(lat1) + B * Math.sin(lat2);

      const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)));
      const lng = toDeg(Math.atan2(y, x));

      const elevation =
        originPoint.elevation +
        (destinationPoint.elevation - originPoint.elevation) * f;

      points.push({ lat, lng, elevation });
    }
    return points
  }

  function getMaxInterferencePoint(){

    let maxInterferencePoint: LatLng = {elevation: 0, lat: 0, lng: 0}
    const originPointToCalc = originPoint
    const destinationPointToCalc = destinationPoint
    while(true){
      let sightLineIsHigher = true
      const sightLineToCalc = generateSightLineWithParams(originPointToCalc, destinationPointToCalc)
      
      for(let i = 0 ; i < elevationPath.length; i++) {
        if(sightLineToCalc[i].elevation >= elevationPath[i].elevation) {
          continue
        } else {
          maxInterferencePoint = elevationPath[i]
          sightLineIsHigher = false
        }
      }
      if(sightLineIsHigher){
        break;
      } else {
        originPointToCalc.elevation += 1
        destinationPointToCalc.elevation += 1
      }
    }
    setMaxInterferencePoint(maxInterferencePoint)
    setMaxInterferencePointDistance(calcularDistanciaHaversine(originPoint.lat, originPoint.lng, maxInterferencePoint.lat, maxInterferencePoint.lng))
  }

  function calculateFresnelRatio(originPoint: LatLng, interestPoint: LatLng, destinationPoint: LatLng, frequence: number): number {
    const totalDistance = calcularDistanciaHaversine(originPoint.lat, originPoint.lng, destinationPoint.lat, destinationPoint.lng)
    const distance1 = calcularDistanciaHaversine(originPoint.lat, originPoint.lng, interestPoint.lat, interestPoint.lng)
    const distance2 = totalDistance - distance1
    const distance1Xdistance2 = distance1 * distance2
    const totalDistanceXfrequece = totalDistance * frequence
    const fresnelRatio = 17.3*Math.sqrt(distance1Xdistance2 / totalDistanceXfrequece)
    return fresnelRatio
  }

  function genereteFresnelElipsoid(frequence: number = 8){
    const topFresnelElipsoid: LatLng[] = []
    const bottomFresnelElipsoid: LatLng[] = []
    sightLine.map((interestPoint) => {
      const fresnelRatioPoint = calculateFresnelRatio(originPoint, interestPoint, destinationPoint, frequence)
      topFresnelElipsoid.push({lat: interestPoint.lat, lng: interestPoint.lng, elevation: interestPoint.elevation + fresnelRatioPoint})
      bottomFresnelElipsoid.push({lat: interestPoint.lat, lng: interestPoint.lng, elevation: interestPoint.elevation - fresnelRatioPoint})
    })
    setTopFresnelElipsoid(topFresnelElipsoid)
    setBottomFresnelElipsoid(bottomFresnelElipsoid)
  }

  useEffect(() => {
    calculateAzimuthInDegrees()
  },[originPoint, destinationPoint])

  useEffect(()=>{
    generateSightLine()
  },[elevationPath])

  useEffect(()=>{
    genereteFresnelElipsoid()
    console.log("elevation path", elevationPath)
    console.log("sightLine", sightLine)
  },[sightLine])

  return {
    destinationPoint,
    distanceInMeters,
    elevationPath,
    originPoint,
    maxInterferencePoint,
    getMaxInterferencePoint,
    setDestinationPoint,
    setDistanceInMeters,
    setElevationPath,
    setOriginalPoint,
    setSightLine,
    sightLine,
    azimuthInDegrees,
    setAzimuthInDegrees,
    maxInterferencePointDistance,
    topFresnelElipsoid,
    bottomFresnelElipsoid
  }
}