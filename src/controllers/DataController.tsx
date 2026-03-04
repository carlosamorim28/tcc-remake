
import { useEffect, useState } from "react";
import ButtonContoller from "./ButtonController";
import { InputController } from "./InputController";
import MapController from "./MapController";
import { calculateFreeSpaceAtenuation } from "../helpers/helper";

export default function DataController() {
  const towerAInput = InputController("Torre A", true)
  const towerBInput = InputController("Torre B", true)
  const twoerAHeight = InputController("Altura torre A", true)
  const twoerBHeight = InputController('Altura torre B', true)
  const adtionalHeight = InputController("Altura adicional")
  const frequency = InputController("Frequencia [GHz]")
  const kFactor = InputController("Fator K0,1%")

  const signalPower = InputController("Potência do Sinal [DBi]")
  const connectoLoss = InputController("Perda por connecto [Db]")
  const cableLoss = InputController("Perda no cabeamento [Db/m]")
  const cableeInMeters = InputController("Cumprimento do cabo [m]")
  const gainAntenaA = InputController("Ganho da antena A [Dbi]")
  const gainAntenaB = InputController("Ganho da antena B [Dbi]")
  const interferenceLoss = InputController("Ptências interferentes em Dbm ex: -98, -90, -99")
  const receptionThreshold = InputController("Limiar de recepção")
  const [margem, setMargem] = useState('')
  
  const mapController =  MapController()
  const {azimuthInDegrees, bottomFresnelElipsoid, bottomFresnelElipsoidNoObstructed, calculateNoObstructedValues, calculateReflexiveRay, destinationPoint, destinationPointNoObstructed, distanceInMeters, elevationPath, fresnalElipsoidRatio,getMaxInterferencePoint, maxInterferencePoint,maxInterferencePointDistance, originPoint, originPointNoObstructed, reflexiveRay, setAzimuthInDegrees,setDestinationPoint, setDistanceInMeters,setElevationPath,setOriginalPoint,setSightLine, sightLine,sightLineNoObstructed,topFresnelElipsoid, topFresnelElipsoidNoObstructed, calculateAzimuthInDegrees, generateSightLine, genereteFresnelElipsoid } = mapController
  
  const generateGraphButton = ButtonContoller("Gerar gráfico Manualmente", () =>{
    const latLngA = towerAInput.value.split(',')
    const latLngB = towerBInput.value.split(',')

    setOriginalPoint({
      lat: Number(latLngA[0].trim()),
      lng: Number(latLngA[1].trim()),
      elevation: originPoint.elevation
    })

    setDestinationPoint({
      lat: Number(latLngB[0].trim()),
      lng: Number(latLngB[1].trim()),
      elevation: originPoint.elevation
    })
  })

  const btnCalculateSafeMargin = ButtonContoller('Calcular Margem de segurança', ()=>{
    calculateSafeMargin()
  })

  function calculateSafeMargin(){
    const PNR = Number(signalPower.value) + Number(gainAntenaA.value) + Number(gainAntenaB.value) - (Number(cableLoss.value) * Number(cableeInMeters.value)) - (Number(connectoLoss) * 4) - calculateFreeSpaceAtenuation(distanceInMeters / 1000, Number(frequency))
    const potenciasInterferentes = interferenceLoss.value.split(',').map((value) => (value.trim())).map((value) => (Math.pow(10,(Number(value)/10))))
    let somaPotenciasInterferentes = 0
    potenciasInterferentes.map((value)=>{
      somaPotenciasInterferentes += value
    })
    const itDb = 10 * Math.log10(somaPotenciasInterferentes) 
    console.log('itDb', itDb)
    const diDb = 10 * Math.log10(Math.pow(10,-9.5) + Math.pow(10, itDb/10)) + 95
    console.log('diDb', diDb)
    const margin = PNR - Number(receptionThreshold.value) -diDb
    console.log( 'margin', margin)
    setMargem(`${margin}`)
  }

  useEffect(()=>{
    frequency.setValue('8')
    kFactor.setValue("0.75")
  },[])
  
  useEffect(() => {
    towerAInput.setValue(`${originPoint.lat}, ${originPoint.lat}`)
    towerBInput.setValue(`${destinationPoint.lat}, ${destinationPoint.lat}`)
    calculateAzimuthInDegrees()
  },[originPoint, destinationPoint])

  useEffect(()=>{
    generateSightLine()
  },[elevationPath])

  useEffect(()=>{
    getMaxInterferencePoint()
    genereteFresnelElipsoid()
  },[sightLine])
  useEffect(()=>{
    calculateNoObstructedValues(Number(frequency.value), twoerAHeight.setValue, twoerBHeight.setValue)
  }, [fresnalElipsoidRatio])

  useEffect(() => {
    calculateReflexiveRay(Number(kFactor.value), Math.pow(10, -9))
  }, [destinationPointNoObstructed])

  return{
    towerAInput,
    towerBInput,
    twoerAHeight,
    twoerBHeight,
    adtionalHeight,
    generateGraphButton,
    mapController,
    frequency,
    kFactor,
    
    receptionThreshold,
    signalPower,
    connectoLoss,
    cableLoss,
    cableeInMeters,
    gainAntenaA,
    gainAntenaB,
    interferenceLoss,
    btnCalculateSafeMargin
  }
}