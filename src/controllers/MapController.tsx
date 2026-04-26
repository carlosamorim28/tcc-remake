import { useState } from "react"
import type LatLng from "../models/LatLng"
import type MapControllerInterface from "../models/MapControllerInterface"
import type AzimuthInterface from "../models/Azimith"
import { calcularDistanciaHaversine, calculateDiagonalDistance } from "../helpers/helper"

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
  const [maxInterferencePointIndex, setMaxInterferencePointIndex] = useState<number>(0)
  const [reflexiveRay, setReflexiveRay] = useState<LatLng[]>([])
  const [reflexivePoint, setRefleexivePoint] = useState<LatLng>({lat:0, lng: 0, elevation: 0})
  const [reflexivePointIndex, setReflexivePointIndex] = useState<number>(0)
  const [azimuthInDegrees, setAzimuthInDegrees] = useState<AzimuthInterface>({normal: 0, inverse: 0})
  const [reflexiveAngle, setReflexiveAngle] = useState<number>(0)
  const [midRoughness, setMidRoughness] = useState<number>(0)
  const [roughnessAtPoint, setRoughnessAtPoint] = useState<number>(0)
  const [maxScaleValue, setMaxScaleValue] = useState<number>(0)


function calculateRainLoss(rainfallRate: number, frequencyGz: number, margem: number): {
  ArH: number
  ArV: number
  finalVerticalLoss: number
  finalHorizontalLoss: number
} {
    console.log('=== calculateRainLoss START ===');
    console.log('inputs:', { rainfallRate, frequencyGz, margem });

    const {aH, aV, kH, kV} = getCoeficiente()
    console.log('coeficientes:', { aH, aV, kH, kV });

    const R = rainfallRate
    const verticalLoss = kV * Math.pow(R, aV)
    const horizontalLoss = kH * Math.pow(R, aH)
    console.log('losses por km:', { verticalLoss, horizontalLoss });

    const r = calculatePercetDistanceRain()
    console.log('r (percentual distância chuva):', r);

    const deffKm = r * (distanceInMeters / 1000)
    console.log('deffKm (diâmetro efetivo célula de chuva):', deffKm);

    const ArV = deffKm * verticalLoss
    const ArH = deffKm * horizontalLoss
    console.log('atenuação total:', { ArV, ArH });

    function calculateIndisponibilidadeVertical(){
      console.log('--- calculateIndisponibilidadeVertical ---');
      const log = Math.log((8.33 * margem) / ArV)
      console.log('log:', log);
      const sqtr = 40.29 - 23.25*log < 0 ? 0 : Math.sqrt(40.29 - 23.25*log)
      console.log('sqtr:', sqtr, '| valor antes do clamp:', 40.29 - 23.25*log);
      const expoente = -6.34 + sqtr
      console.log('expoente:', expoente);
      const result = Math.pow(10, expoente)
      console.log('indisponibilidade vertical:', result);
      return result
    }

    function calculateIndisponibilidadeHorizontal(){
      console.log('--- calculateIndisponibilidadeHorizontal ---');
      const log = Math.log((8.33 * margem) / ArH)
      console.log('log:', log);
      const sqtr = 40.29 - 23.25*log < 0 ? 0 : Math.sqrt(40.29 - 23.25*log)
      console.log('sqtr:', sqtr, '| valor antes do clamp:', 40.29 - 23.25*log);
      const expoente = -6.34 + sqtr
      console.log('expoente:', expoente);
      const result = Math.pow(10, expoente)
      console.log('indisponibilidade horizontal:', result);
      return result
    }

    function calculatePercetDistanceRain(){
      const distanceInKm = distanceInMeters / 1000
      const exponent = -0.015 * R
      const d0 = 35 * Math.pow(Math.E, exponent)
      const ratio = distanceInKm / d0
      const result = 1 / (1 + ratio)
      console.log('calculatePercetDistanceRain:', { 
        distanceInMeters,
        distanceInKm,
        R,
        exponent,
        d0,
        ratio,
        result 
      });
      return result
    }

    function getCoeficiente(){
      const coeficientes = [
        {"frequencia_GHz": 1, "kH": 0.0000387, "kV": 0.0000352, "aH": 0.912, "aV": 0.880},
        {"frequencia_GHz": 2, "kH": 0.000154, "kV": 0.000138, "aH": 0.963, "aV": 0.923},
        {"frequencia_GHz": 4, "kH": 0.000650, "kV": 0.000591, "aH": 1.121, "aV": 1.075},
        {"frequencia_GHz": 6, "kH": 0.00175, "kV": 0.00155, "aH": 1.308, "aV": 1.265},
        {"frequencia_GHz": 7, "kH": 0.00301, "kV": 0.00265, "aH": 1.332, "aV": 1.312},
        {"frequencia_GHz": 8, "kH": 0.00454, "kV": 0.00395, "aH": 1.327, "aV": 1.310},
        {"frequencia_GHz": 10, "kH": 0.0101, "kV": 0.00887, "aH": 1.276, "aV": 1.264},
        {"frequencia_GHz": 12, "kH": 0.0188, "kV": 0.0168, "aH": 1.217, "aV": 1.200},
        {"frequencia_GHz": 15, "kH": 0.0367, "kV": 0.0335, "aH": 1.154, "aV": 1.128},
        {"frequencia_GHz": 18, "kH": 0.0495, "kV": 0.0442, "aH": 1.110, "aV": 1.091},
        {"frequencia_GHz": 20, "kH": 0.0751, "kV": 0.0691, "aH": 1.099, "aV": 1.065},
        {"frequencia_GHz": 23, "kH": 0.0789, "kV": 0.0705, "aH": 1.067, "aV": 1.049},
        {"frequencia_GHz": 25, "kH": 0.124, "kV": 0.113, "aH": 1.061, "aV": 1.030},
        {"frequencia_GHz": 30, "kH": 0.187, "kV": 0.167, "aH": 1.021, "aV": 1.000},
        {"frequencia_GHz": 35, "kH": 0.263, "kV": 0.233, "aH": 0.979, "aV": 0.963},
        {"frequencia_GHz": 40, "kH": 0.350, "kV": 0.310, "aH": 0.939, "aV": 0.929},
        {"frequencia_GHz": 45, "kH": 0.442, "kV": 0.393, "aH": 0.903, "aV": 0.897},
        {"frequencia_GHz": 50, "kH": 0.536, "kV": 0.479, "aH": 0.873, "aV": 0.868},
        {"frequencia_GHz": 60, "kH": 0.707, "kV": 0.642, "aH": 0.826, "aV": 0.824},
        {"frequencia_GHz": 70, "kH": 0.851, "kV": 0.784, "aH": 0.793, "aV": 0.793},
        {"frequencia_GHz": 80, "kH": 0.975, "kV": 0.906, "aH": 0.769, "aV": 0.769},
        {"frequencia_GHz": 90, "kH": 1.06, "kV": 0.999, "aH": 0.753, "aV": 0.754},
        {"frequencia_GHz": 100, "kH": 1.12, "kV": 1.06, "aH": 0.743, "aV": 0.744},
        {"frequencia_GHz": 120, "kH": 1.18, "kV": 1.13, "aH": 0.731, "aV": 0.732},
        {"frequencia_GHz": 150, "kH": 1.31, "kV": 1.27, "aH": 0.710, "aV": 0.711},
        {"frequencia_GHz": 200, "kH": 1.45, "kV": 1.42, "aH": 0.689, "aV": 0.690},
        {"frequencia_GHz": 300, "kH": 1.36, "kV": 1.35, "aH": 0.688, "aV": 0.689},
        {"frequencia_GHz": 400, "kH": 1.32, "kV": 1.31, "aH": 0.683, "aV": 0.684}
      ]
      if(frequencyGz <= 1) {
        console.log('getCoeficiente: frequência <= 1, usando índice 0');
        return coeficientes[0]
      }
      if (frequencyGz >= 400){
        console.log('getCoeficiente: frequência >= 400, usando último índice');
        return coeficientes[coeficientes.length-1]
      }
      let selectedIndex = -1
      for (let i = 0; i < coeficientes.length; i ++){
         if(coeficientes[i].frequencia_GHz <= frequencyGz) {
          selectedIndex = i;
         }
      }
      console.log('getCoeficiente: selectedIndex:', selectedIndex, '| frequência do índice:', coeficientes[selectedIndex].frequencia_GHz);
      if(coeficientes[selectedIndex].frequencia_GHz === frequencyGz) {
        console.log('getCoeficiente: frequência exata encontrada, usando índice:', selectedIndex);
        return coeficientes[selectedIndex]
      }
      console.log('getCoeficiente: interpolando para índice:', selectedIndex + 1, '| frequência:', coeficientes[selectedIndex + 1].frequencia_GHz);
      return coeficientes[selectedIndex + 1]
    }

    const result = {
      ArH,
      ArV,
      finalHorizontalLoss: calculateIndisponibilidadeHorizontal(),
      finalVerticalLoss: calculateIndisponibilidadeVertical()
    }
    console.log('=== calculateRainLoss END ===', result);
    return result
  }
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
    let interefereceIndex = 0
    while(true){
      let sightLineIsHigher = true
      const sightLineToCalc = generateSightLineWithParams(originPointToCalc, destinationPointToCalc)
      
      for(let i = 0 ; i < elevationPath.length; i++) {
        if(sightLineToCalc[i].elevation >= elevationPath[i].elevation) {
          continue
        } else {
          maxInterferencePoint = elevationPath[i]
          interefereceIndex = i
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
    setMaxInterferencePointIndex(interefereceIndex)
    setMaxInterferencePointDistance(calcularDistanciaHaversine(originPoint.lat, originPoint.lng, maxInterferencePoint.lat, maxInterferencePoint.lng))
  }

  function calculateFresnelRatio(originPoint: LatLng, interestPoint: LatLng, destinationPoint: LatLng, frequence: number): number {
    const totalDistance = calcularDistanciaHaversine(originPoint.lat, originPoint.lng, destinationPoint.lat, destinationPoint.lng) / 1000
    const distance1 = calcularDistanciaHaversine(originPoint.lat, originPoint.lng, interestPoint.lat, interestPoint.lng) / 1000
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

   function releasePercentFresnelRatio(data: {frequency: number, towerAHeigth: number, towerBHeigth: number, kMinValue: number, kMedValue: number, useTecnicalNorm: boolean}){
    console.log('=== releasePercentFresnelRatio START ===');
    console.log('inputs:', data);

    if(!data.useTecnicalNorm){
      console.log('useTecnicalNorm=false, retornando 1 sem cálculo');
      return 1 
    }

    let kMedPercent = 0
    let kMinPercent = 0
    if (data.frequency >= 2.5){
      kMedPercent = 1
      kMinPercent = 0.6
    } else if (data.frequency >= 1 && data.frequency < 2.5) {
      kMedPercent = 0.6
      kMinPercent = 0.3
    } else if(data.frequency < 1) {
      kMedPercent = 0.3
      kMinPercent = 0.1
    }
    console.log('percentuais por faixa de frequência:', { frequency: data.frequency, kMedPercent, kMinPercent });

    const distanceInKm = distanceInMeters / 1000
    const maxInterferencePointDistanceInKm = maxInterferencePointDistance / 1000
    console.log('distâncias:', { distanceInMeters, distanceInKm, maxInterferencePointDistance, maxInterferencePointDistanceInKm });

    const elevationA = elevationPath[0].elevation + data.towerAHeigth
    const elevationB = elevationPath[elevationPath.length - 1].elevation + data.towerBHeigth
    const commumTerm = ((distanceInKm - maxInterferencePointDistanceInKm) * elevationA + maxInterferencePointDistanceInKm * elevationB) / distanceInKm
    console.log('commumTerm:', {
      elevationA,
      elevationB,
      commumTerm
    });

    function variableTerm(kValue: number): number {
      const d1 = maxInterferencePointDistanceInKm
      const d2 = distanceInKm - maxInterferencePointDistanceInKm
      const RmedInKm = 6370
      const result = (d1 * d2 * Math.pow(10, 3)) / (2 * RmedInKm * kValue)
      console.log('variableTerm:', { kValue, d1, d2, RmedInKm, result });
      return result
    }

    const fresnelDiff = topFresnelElipsoid[maxInterferencePointIndex].elevation - sightLine[maxInterferencePointIndex].elevation
    console.log('fresnelDiff (topo elipsoide - linha de visada):', fresnelDiff);
    console.log('maxInterferencePoint.elevation:', maxInterferencePoint.elevation);

    const atenuationKmed = commumTerm - variableTerm(data.kMedValue) - kMedPercent * fresnelDiff - maxInterferencePoint.elevation
    const atenuationKmin = commumTerm - variableTerm(data.kMinValue) - kMinPercent * fresnelDiff - maxInterferencePoint.elevation
    console.log('atenuações:', { atenuationKmed, atenuationKmin });

    if(atenuationKmin < atenuationKmed) {
      const result = kMinPercent === 1 ? 1 : 2 - kMinPercent
      console.log('atenuationKmin < atenuationKmed → usando kMinPercent:', kMinPercent, '→ resultado:', result);
      console.log('=== releasePercentFresnelRatio END ===');
      return result
    } else {
      const result = kMedPercent === 1 ? 1 : 2 - kMedPercent
      console.log('atenuationKmin >= atenuationKmed → usando kMedPercent:', kMedPercent, '→ resultado:', result);
      console.log('=== releasePercentFresnelRatio END ===');
      return result
    }
  }


  function calculateNoObstructedValues(
    frequence: number = 8,
    setheightTwoerA: (value: string) => void,
    setheightTwoerB: (value: string) => void,
    towerAHeigth: number,
    towerBHeigth: number,
    useTecnicalNorm: boolean = true,
  ) {

    let calculatedHeight = 0
    const originPointToCalc = { ...originPoint }
    const destinationPointToCalc = { ...destinationPoint }


    while(true){
      let sightLineIsHigher = true
      const sightLineToCalc = generateSightLineWithParams(originPointToCalc, destinationPointToCalc).map((point, index) => { return { ...point, elevation: point.elevation - fresnalElipsoidRatio[index] } })
      
      for(let i = 0 ; i < elevationPath.length; i++) {
        if((sightLineToCalc[i].elevation * releasePercentFresnelRatio({
          frequency: frequence,
          kMedValue: -57,
          kMinValue: -35,
          towerAHeigth,
          towerBHeigth,
          useTecnicalNorm
        }))  > elevationPath[i].elevation) {
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
    const part2RelfextRay: LatLng[] = generateSightLineWithParams(elevationPath[reflectedPointIndex], destinationPointNoObstructed, elevationPath.length - reflectedPointIndex)
    setRefleexivePoint(elevationPath[reflectedPointIndex])
    setReflexivePointIndex(reflectedPointIndex)
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
  

  function calculateRoughness() {
    const elevationPathToCalculate = [...elevationPath]
    const originPointToCalculate = {...originPoint}

    function sumDiXHi(){
      let result = 0
      elevationPathToCalculate.map((element) => {
        result += element.elevation * calcularDistanciaHaversine(originPointToCalculate.lat, originPointToCalculate.lng, element.lat, element.lng)
      })
      return result
    }

    function sumDI(){
      let result = 0
      elevationPathToCalculate.map((element)=>{
        result += calcularDistanciaHaversine(originPointToCalculate.lat, originPointToCalculate.lng, element.lat, element.lng)
      })
      return result
    }
    function sumDISqr(){
      let result = 0
      elevationPathToCalculate.map((element)=>{
        result += Math.pow(calcularDistanciaHaversine(originPointToCalculate.lat, originPointToCalculate.lng, element.lat, element.lng), 2)
      })
      return result
    }
    function sumHi(){
      let result = 0
      elevationPathToCalculate.map((element)=>{
        result += element.elevation
      })
      return result
    }
    const c2Numerador = sumDiXHi() - (sumDI()*sumHi() / elevationPathToCalculate.length)
    const c2Denominador = sumDISqr() - (Math.pow(sumDI(), 2) / elevationPathToCalculate.length)
    const c2 = c2Numerador / c2Denominador
    const c1 = (sumHi() / elevationPathToCalculate.length) - c2*(sumDI() / elevationPath.length)
    const y = elevationPathToCalculate.map((element) => { return c1+c2 * calcularDistanciaHaversine(originPointToCalculate.lat, originPointToCalculate.lng, element.lat, element.lng) })
    function sumHiSubYi(){
      let result = 0
      y.map((yAtual, index) =>{
        result += Math.pow(elevationPathToCalculate[index].elevation - yAtual, 2)
      })
      return result
    }
    const s2 = Math.sqrt(sumHiSubYi()/(elevationPathToCalculate.length - 1))
    const yMedio = sumHi() / elevationPathToCalculate.length
    function sumHiSubYMedio(){
      let result = 0
      elevationPathToCalculate.map((element)=>{
        result += Math.pow(element.elevation - yMedio, 2)
      })
      return result
    }
    const s1 = Math.sqrt(sumHiSubYMedio() / (elevationPathToCalculate.length - 1) )
    const si = Math.sqrt(s1 * s2)
    const b = Math.pow(si / 15, -1.3)
    setMidRoughness(b)
    // return b
  }

  function calculateRoughnessAtPoint(frequency: number){
    // const angle = Math.acos(calcularDistanciaHaversine(originPoint.lat, originPoint.lng, reflexivePoint.lat, reflexivePoint.lng) / calculateDiagonalDistance(originPoint, reflexivePoint));
    const angle = Math.atan2(Math.abs(originPointNoObstructed.elevation - reflexivePoint.elevation), calcularDistanciaHaversine(originPointNoObstructed.lat, originPointNoObstructed.lng, reflexivePoint.lat, reflexivePoint.lng))
    console.log('comparativo de distancias', Math.abs(originPointNoObstructed.elevation - reflexivePoint.elevation), calcularDistanciaHaversine(originPointNoObstructed.lat, originPointNoObstructed.lng, reflexivePoint.lat, reflexivePoint.lng), angle)

    setReflexiveAngle(angle)
    const value = 300 / ( 16 * frequency * 1000 * angle)
    setRoughnessAtPoint(value) 
  }

  function calculateReflexiveArea(): number{
    const fresnelRatioReflexivePoint = Math.abs(sightLineNoObstructed[reflexivePointIndex].elevation - topFresnelElipsoidNoObstructed[reflexivePointIndex].elevation)
    const a = Math.pow(fresnelRatioReflexivePoint, 2) * (Math.PI / reflexiveAngle) 
    return a
  }

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
    calculateReflexiveRay,
    calculateAzimuthInDegrees,
    genereteFresnelElipsoid,
    generateSightLine,
    midRoughness, 
    setMidRoughness,
    roughnessAtPoint, 
    setRoughnessAtPoint,
    calculateRoughness,
    calculateRoughnessAtPoint,
    reflexivePoint,
    reflexiveAngle,
    reflexivePointIndex,
    calculateReflexiveArea,
    maxScaleValue, 
    setMaxScaleValue,
    calculateRainLoss
  }
}