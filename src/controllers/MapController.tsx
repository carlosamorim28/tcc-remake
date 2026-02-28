import { useEffect, useState } from "react"
import type LatLng from "../models/LatLng"
import type MapControllerInterface from "../models/MapControllerInterface"
import type AzimuthInterface from "../models/Azimith"
import { calcularDistanciaHaversine } from "../helpers/helper"

export default function MapController(): MapControllerInterface {
  const [originPoint, setOriginalPoint] =  useState<LatLng>({lat:0, lng: 0, elevation: 0})
  const [originPointNoObstructed, setOriginalPointNoObstructed] =  useState<LatLng>({lat:0, lng: 0, elevation: 0})
  const [destinationPoint, setDestinationPoint] =  useState<LatLng>({lat: 0, lng: 0, elevation: 0})
  const [destinationPointNoObstructed, setDestinationPointNoObstructed] =  useState<LatLng>({lat: 0, lng: 0, elevation: 0})
  
  const [elevationPath, setElevationPath] = useState<LatLng[]>([])
  const [distanceInMeters, setDistanceInMeters] = useState<number>(0)
  
  const [sightLine, setSightLine] = useState<LatLng[]>([]) // linha de visada
  const [sightLineNoObstructed, setSightLineNoObstructed] = useState<LatLng[]>([]) // linha de visada não obstruída
  
  const [fresnalElipsoidRatio, setFresnelElipsoidRatio] = useState<number[]>([])
  
  const [topFresnelElipsoid, setTopFresnelElipsoid] = useState<LatLng[]>([])
  const [bottomFresnelElipsoid, setBottomFresnelElipsoid] = useState<LatLng[]>([])
  const [topFresnelElipsoidNoObstructed, setTopFresnelElipsoidNoObstructed] = useState<LatLng[]>([])
  const [bottomFresnelElipsoidNoObstructed, setBottomFresnelElipsoidNoObstructed] = useState<LatLng[]>([])

  const [maxInterferencePoint, setMaxInterferencePoint] = useState<LatLng>({elevation: 0, lat: 0, lng: 0})
  const [maxInterferencePointDistance, setMaxInterferencePointDistance] = useState<number>(0)
  const [reflexiveRay, setReflexiveRay] = useState<LatLng[]>([])
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

    function generateSightLineWithParams(originPoint: LatLng, destinationPoint: LatLng, length?: number): LatLng[]{
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
    const lengthUsed = length ?? elevationPath.length
    // Se os pontos forem idênticos
    if (d === 0) {
      return Array.from({ length: lengthUsed }, () => originPoint);
    }

    for (let i = 0; i < lengthUsed; i++) {

      // Aqui está a correção:
      // usamos (lengthUsed - 1)
      const f = i / (lengthUsed - 1);

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
    const originPointToCalc = { ...originPoint }
    const destinationPointToCalc = { ...destinationPoint }
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
    if(Math.abs(distance2) < 0.01) return 0
    const fresnelRatio = 17.3*Math.sqrt(distance1Xdistance2 / totalDistanceXfrequece)
    return fresnelRatio
  }

  function genereteFresnelElipsoid(frequence: number = 8){
    const topFresnelElipsoid: LatLng[] = []
    const bottomFresnelElipsoid: LatLng[] = []
    const fresnelElipsoideRatio: number[] = []
    sightLine.map((interestPoint) => {
      const fresnelRatioPoint = calculateFresnelRatio(originPoint, interestPoint, destinationPoint, frequence)
      topFresnelElipsoid.push({lat: interestPoint.lat, lng: interestPoint.lng, elevation: interestPoint.elevation + fresnelRatioPoint})
      bottomFresnelElipsoid.push({lat: interestPoint.lat, lng: interestPoint.lng, elevation: interestPoint.elevation - fresnelRatioPoint})
      fresnelElipsoideRatio.push(fresnelRatioPoint)
    })
    setTopFresnelElipsoid(topFresnelElipsoid)
    setBottomFresnelElipsoid(bottomFresnelElipsoid)
    setFresnelElipsoidRatio(fresnelElipsoideRatio)
  }

  function releasePercentFresnelRatio(frequence: number){
    return 1
  }

  function calculateNoObstructedValues(frequence: number = 8, setheightTwoerA: (value: string) => void, setheightTwoerB: (value: string) => void) {

    let calculatedHeight = 0
    const originPointToCalc = { ...originPoint }
    const destinationPointToCalc = { ...destinationPoint }


    while(true){
      let sightLineIsHigher = true
      const sightLineToCalc = generateSightLineWithParams(originPointToCalc, destinationPointToCalc).map((point, index) => { return { ...point, elevation: point.elevation - fresnalElipsoidRatio[index] } })
      
      for(let i = 0 ; i < elevationPath.length; i++) {
        if((sightLineToCalc[i].elevation * releasePercentFresnelRatio(frequence))  > elevationPath[i].elevation) {
          continue
        } else {
          sightLineIsHigher = false
        }
      }
      if(sightLineIsHigher){
        break;
      } else {
        originPointToCalc.elevation += 1
        destinationPointToCalc.elevation += 1
        calculatedHeight += 1
      }

      
    }

    setOriginalPointNoObstructed(originPointToCalc)
    setDestinationPointNoObstructed(destinationPointToCalc)
    setSightLineNoObstructed(generateSightLineWithParams(originPointToCalc, destinationPointToCalc))
    setTopFresnelElipsoidNoObstructed(generateSightLineWithParams(originPointToCalc, destinationPointToCalc).map((point, index) => { return { ...point, elevation: point.elevation + fresnalElipsoidRatio[index] } }))
    setBottomFresnelElipsoidNoObstructed(generateSightLineWithParams(originPointToCalc, destinationPointToCalc).map((point, index) => { return { ...point, elevation: point.elevation - fresnalElipsoidRatio[index] } }))
    setheightTwoerA(`${calculatedHeight}`)
    setheightTwoerB(`${calculatedHeight}`)
  }

  function calculateReflexiveRay(kFactor: number = 0.75, precision: number = 10){ 
    if(originPointNoObstructed.lat === 0  || originPointNoObstructed.lng === 0 || destinationPointNoObstructed.lat === 0 || destinationPointNoObstructed.lng === 0) return

    const hanta = originPointNoObstructed.elevation;
    const ha = originPoint.elevation;
    const hantb = destinationPointNoObstructed.elevation;
    const hb = destinationPoint.elevation;
    const k = kFactor;
    const aux = distanceInMeters / 1000;
    const d = distanceInMeters; // metros
    const e = precision;

    const h1 = hanta + ha;
    const h2 = hantb + hb;

    let xo = h2 / (h1 + h2); // Aproximação Inicial
    const r = 6370e3;

    const aux1 = (h1 * k * r) / (d ** 2);
    const aux2 = 0.5 - ((h1 + h2) * k * r) / (d ** 2);

    let fx = xo ** 3 - 1.5 * (xo ** 2) + (aux2 * xo) + aux1;
    let fxl = 3 * (xo ** 2) - 3 * xo + aux2;

    let d1, d2;

    if (Math.abs(fx) < e) {
      d1 = (d * xo) / 1000;          // km
      d2 = ((1 - xo) * d) / 1000;    // km
    }

    while (Math.abs(fx) > e) {
      const x = xo - (fx / fxl);
      fx = x ** 3 - 1.5 * (x ** 2) + (aux2 * x) + aux1;
      fxl = 3 * (x ** 2) - 3 * x + aux2;
      xo = x;

      d1 = (d * x) / 1000;           // km
      d2 = ((1 - x) * d) / 1000;     // km
    }

    const reflectedPointIndex = selectPointIndex(d1! * 1000)
    const part1RelfextRay: LatLng[] = generateSightLineWithParams(originPointNoObstructed, elevationPath[reflectedPointIndex], reflectedPointIndex)
    const part2RelfextRay: LatLng[] = generateSightLineWithParams(elevationPath[reflectedPointIndex+1], destinationPointNoObstructed, elevationPath.length - reflectedPointIndex)
    setReflexiveRay([...part1RelfextRay, ...part2RelfextRay])

    function selectPointIndex(testedDistance: number): number {
      let actualDistance = 1000000000
      let actualIndex = 0
      elevationPath.forEach((point, index) =>{
        const calculatedDistance = calcularDistanciaHaversine(originPoint.lat, originPoint.lng, point.lat, point.lng)
        if(Math.abs(testedDistance - calculatedDistance) < actualDistance){
          actualDistance = Math.abs(testedDistance - calculatedDistance)
          actualIndex = index
        }
      })
      return actualIndex
    }
  }

  useEffect(() => {
    calculateAzimuthInDegrees()
  },[originPoint, destinationPoint])

  useEffect(()=>{
    generateSightLine()
  },[elevationPath])

  useEffect(()=>{
    genereteFresnelElipsoid()
  },[sightLine])

  return {
    destinationPoint,
    distanceInMeters,
    elevationPath,
    originPoint,
    maxInterferencePoint,
    sightLine,
    azimuthInDegrees,
    maxInterferencePointDistance,
    topFresnelElipsoid,
    bottomFresnelElipsoid,
    fresnalElipsoidRatio,
    originPointNoObstructed,
    destinationPointNoObstructed,
    topFresnelElipsoidNoObstructed,
    bottomFresnelElipsoidNoObstructed,
    sightLineNoObstructed,
    reflexiveRay,
    getMaxInterferencePoint,
    setDestinationPoint,
    setDistanceInMeters,
    setElevationPath,
    setOriginalPoint,
    setSightLine,
    setAzimuthInDegrees,
    calculateNoObstructedValues,
    calculateReflexiveRay
  }
}