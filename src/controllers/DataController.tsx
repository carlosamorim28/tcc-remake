
import { useEffect, useState } from "react";
import ButtonContoller from "./ButtonController";
import CheckboxController from "./CheckboxController";
import { InputController } from "./InputController";
import { SelectController } from "./SelectController";
import MapController from "./MapController";
import MenuController from "./MenuController";
import { calculateFreeSpaceAtenuation } from "../helpers/helper";
import { calcularDistanciaHaversine } from "../helpers/helper";
import { useInterferencePowerControllers } from "./useInterferencePowerControllers";
import type LatLng from "../models/LatLng";

export default function DataController() {
  const towerAInput = InputController("Torre A", true)
  const towerBInput = InputController("Torre B", true)
  const twoerAHeight = InputController("Altura torre A", true)
  const twoerBHeight = InputController('Altura torre B', true)
  const adtionalHeight = InputController("Altura adicional")
  const frequency = InputController("Frequencia [GHz]")
  const kFactor = InputController("Fator K0,1%")

  const signalPower = InputController("Potência de Tx [dBm]")
  const receptionThreshold = InputController("Limiar de Rx [dbm]")
  const connectoLoss = InputController("Perda por conector [dB]")
  const cableLoss = InputController("Perda no Guia de onda [dB/m]")
  const cableeInMeters = InputController("Comprimento total do guia de onda nas duas estações[m]")
  const technicalReserve = InputController("Reserva técnica [m]")
  const duplexorLoss = InputController("Perdas nos duplexadores [dB]")
  const gainAntenaA = InputController("Ganho da antena A [dBi]")
  const gainAntenaB = InputController("Ganho da antena B [dBi]")
  const useTecnicalNormCheckbox = CheckboxController("Usar norma técnica", false)
  const taxaPluviometricaInput = InputController('Taxa Pluviometrica para 0,01% do tempo (mm/h)')

  const [isFirst, setIsFirst] = useState<boolean>(true)
  const [horizontalRainAttenuationDb, setHorizontalRainAttenuationDb] = useState('')
  const [marginWithRainLossVertical, setMarginWithRainLossVertical] = useState('');
  const [marginWithRainLossHorizontal, setMarginWithRainLossHorizontal] = useState('');
  const [verticalRainAttenuationDb, setVerticalRainAttenuationDb] = useState('')
  const [horizontalRainUnavailability, setHorizontalRainUnavailability] = useState('')
  const [verticalRainUnavailability, setVerticalRainUnavailability] = useState('')
  const [verticalRainViability, setVerticalRainViabitility] = useState('')
  const [horizontalRainViability, setHorizontalRainViabitility] = useState('')
  const [viabilidadeDevanecimento, setViabilidadeDevanecimento] = useState('')
  const [degradacao, setDegradacao] = useState<number>(0)
  const [Hu, setHu] = useState(0)


  // const interferenceLoss = InputController("Ptências interferentes em Dbm ex: -98, -90, -99")
  const inputsInterferenceNumberController = InputController('Quantidade de Potências interferentes')
  const inputsInterferecePower = useInterferencePowerControllers()
  
  const [margem, setMargem] = useState('')
  const [pnrDb, setPnrDb] = useState('')
  const [devanecimentoPlano, setDevanecimentoPlano] = useState(0)
  const [devanecimentoSeletivo, setDevanecimentoSeletivo] = useState({
    ps6: 0,
    pd: 0,
    pt: 0,
  })

  const roloffInput = InputController("Rolloff")
  const tipoRadioclimaSelect = SelectController(
    "Tipo radioclima",
    [
      { label: "1 (frac=0.05)", value: "1" },
      { label: "2 (frac=0.15)", value: "2" },
      { label: "3 (frac=0.30)", value: "3" },
      { label: "4 (frac=0.45)", value: "4" },
      { label: "5 (frac=0.60)", value: "5" },
      { label: "6 (frac=0.80)", value: "6" },
    ],
    true,
    "1",
  )

  const climaTypeSelect = SelectController(
    "Clima",
    [
      { label: "0 (qc=0.32)", value: "0" },
      { label: "1 (qc=0.68)", value: "1" },
      { label: "2 (qc=1.00)", value: "2" },
      { label: "3 (qc=1.32)", value: "3" },
    ],
    true,
    "0",
  )

  const relevoTypeSelect = SelectController(
    "Relevo",
    [
      { label: "agua", value: "agua" },
      { label: "urbano ou plano", value: "urbano ou plano" },
      { label: "normal", value: "normal" },
      { label: "morros", value: "morros" },
      { label: "montanha", value: "montanha" },
    ],
    true,
    "normal",
  )
  
  const mapController =  MapController()
  const menuController = MenuController()
  const {
    calculateNoObstructedValues,
    calculateReflexiveRay,
    destinationPoint,
    destinationPointNoObstructed,
    distanceInMeters,
    elevationPath,
    fresnalElipsoidRatio,
    getMaxInterferencePoint,
    originPoint,
    reflexiveRay,
    setDestinationPoint,
    setDistanceInMeters,
    setElevationPath,
    setOriginalPoint,
    sightLine,
    topFresnelElipsoidNoObstructed,
    calculateAzimuthInDegrees,
    generateSightLine,
    genereteFresnelElipsoid,
    midRoughness,
    roughnessAtPoint,
    changeOrigin,
    setChangeOrigin,
    maxInterferencePoint,
    maxInterferencePointDistance,
    maxInterferencePointIndex,
    elevationPathWithHu,
    setelevationPathWithHu
  } = mapController

  function calculateDevanecimentoSeletivo(roloff: number, tipoRadioclima: number) {
    let c6 = 0
    let w6 = 0
    let aSobreT6 = 0
    let c3 = 0
    let w3 = 0
    let aSobreT3 = 0
    let frac = 0

    switch (tipoRadioclima) {
      case 1:
        frac = 0.05
        break
      case 2:
        frac = 0.15
        break
      case 3:
        frac = 0.30
        break
      case 4:
        frac = 0.45
        break
      case 5:
        frac = 0.60
        break
      case 6:
        frac = 0.80
        break
      default:
        frac = 0
    }

    const distanceInKm = distanceInMeters / 1000

    const i =
      Math.abs(mapController.originPoint.elevation - mapController.destinationPoint.elevation) /
      distanceInKm

    const r = frac * Math.pow(distanceInKm, 0.5) + Math.exp(-0.3 * i)

    const v2 = (5 / 7) * r

    if (roloff <= 0.3) {
      c6 = 0.981
      w6 = 35
      aSobreT6 = 0.017
      c3 = 0.951
      w3 = 32.2
      aSobreT3 = 0.014
    } else {
      c6 = 33
      w6 = 0.981
      aSobreT6 = 0.016
      c3 = 0.0951
      w3 = 33
      aSobreT3 = 0.013
    }

    const ps6 = (c6 * w6 * aSobreT6 - c3 * w3 * aSobreT3) * (Math.pow(r, 2) * v2)

    const n = 1 - Math.exp(-0.2 * Math.pow(devanecimentoPlano, 0.75))

    const pd = ps6 * n

    const pt = pd * devanecimentoPlano
    const valor = distanceInKm / (2500 * 0.0054)
    if( pt < valor){
      setViabilidadeDevanecimento('Viável')
    } else {
      setViabilidadeDevanecimento('Inviável')
    }

    setDevanecimentoSeletivo({ ps6, pd, pt })
  }


  function calculateDevanecimentoPlano(climaType: string, releveType: string) {
    let qt: number = 0;
    let qc: number = 0;
    const n: number = Number(climaType);

    if(releveType === 'agua') qt = 4.8
    if(releveType === 'urbano ou plano') qt = 2.4
    if(releveType === 'normal') qt = 1.0
    if( releveType === 'morros') qt = 0.6
    if(releveType === 'montanha') qt = 0.38

    if(n === 0) qc = 0.32
    if(n === 1) qc = 0.68
    if(n === 2) qc = 1
    if(n === 3) qc = 1.32

    const distanceInKm = distanceInMeters / 1000

    const P0 = 0.37 * qt * qc * (Number(frequency.value)/ 4.7) * Math.pow(distanceInKm / 50, 3)
    const Pf = P0 * Math.pow(10, (-margem / 10))
    setDevanecimentoPlano(Pf)
  }

  const calculateTaxaPluviometricaButton = ButtonContoller('Calcular Taxa Pluviométrica', () => {
      const { ArH, ArV, finalHorizontalLoss, finalVerticalLoss } = mapController.calculateRainLoss(Number(taxaPluviometricaInput.value), Number(frequency.value), 20)
      setHorizontalRainAttenuationDb(String(ArH))
      setVerticalRainAttenuationDb(String(ArV))
      setMarginWithRainLossHorizontal(String(Number(margem) - ArH))
      setMarginWithRainLossVertical(String(Number(margem) - ArV))
      setHorizontalRainUnavailability(String(finalHorizontalLoss))
      setVerticalRainUnavailability(String(finalVerticalLoss))

      const distanceInKm = distanceInMeters / 1000

      const valor = (distanceInKm / 2500) * 0.0003

      if( finalHorizontalLoss < valor){
        setVerticalRainViabitility('Viável')
      } else {
        setVerticalRainViabitility('Inviável')
      }
      if( finalVerticalLoss < valor){
        setHorizontalRainViabitility('Viável')
      } else {
        setHorizontalRainViabitility('Inviável')
      }


  })

function parseTowerCoordinates(value: string): { lat: number; lng: number } | null {
  const [latRaw, lngRaw] = value.split(",")
  if (latRaw === undefined || lngRaw === undefined) return null

  const lat = Number(latRaw.trim())
  const lng = Number(lngRaw.trim())

  if (Number.isNaN(lat) || Number.isNaN(lng)) return null
  if (lat === 0 && lng === 0) return null

  return { lat, lng }
}

function getElevationForLocation(lat: number, lng: number): Promise<LatLng | null> {
  return new Promise((resolve) => {
    const elevator = new google.maps.ElevationService()
    elevator.getElevationForLocations(
      { locations: [{ lat, lng }] },
      (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          resolve({
            lat,
            lng,
            elevation: results[0].elevation,
          })
          return
        }

        console.error("Erro ao obter elevação:", status)
        resolve(null)
      },
    )
  })
}

const generateGraphButton = ButtonContoller(
  "Gerar gráfico Manualmente",
  async () => {
    const origemCoords = parseTowerCoordinates(towerAInput.value)
    const destinoCoords = parseTowerCoordinates(towerBInput.value)

    if (!origemCoords || !destinoCoords) {
      console.error("Coordenadas inválidas nos campos Torre A / Torre B.")
      return
    }

    const [origem, destino] = await Promise.all([
      getElevationForLocation(origemCoords.lat, origemCoords.lng),
      getElevationForLocation(destinoCoords.lat, destinoCoords.lng),
    ])

    if (!origem || !destino) {
      console.error("Não foi possível obter a elevação dos dois pontos.")
      return
    }

    setOriginalPoint(origem)
    setDestinationPoint(destino)
    setChangeOrigin("input")
  },
);

   const btnAttFresnelElipsoid = ButtonContoller('Recalcular Gráfico', ()=>{
    genereteFresnelElipsoid(Number(frequency.value))
  })

  const btnCalculateSafeMargin = ButtonContoller('Calcular Margem de segurança', ()=>{
    calculateSafeMargin()
  })

  const calculateDevanecimentoPlanoButton = ButtonContoller(
    "Calcular devanecimento plano",
    () => {
      calculateDevanecimentoPlano(climaTypeSelect.value, relevoTypeSelect.value)
    },
  )

  const calculateDevanecimentoSeletivoButton = ButtonContoller(
    "Calcular devanecimento seletivo",
    () => {
      calculateDevanecimentoSeletivo(
        Number(roloffInput.value),
        Number(tipoRadioclimaSelect.value),
      )
    },
  )

 

function calculateSafeMargin() {
    const PNR = Number(signalPower.value) + Number(gainAntenaA.value) + Number(gainAntenaB.value) - (Number(cableLoss.value) * (Number(cableeInMeters.value) + Number(technicalReserve.value))) - (Number(connectoLoss.value) * 4) - calculateFreeSpaceAtenuation(distanceInMeters / 1000, Number(frequency.value)) - 2 * Number(duplexorLoss.value)
    const potenciasInterferentes = inputsInterferecePower.filter((item) => (item.value !== '')).map((value, index) => (index < Number(inputsInterferenceNumberController.value) && value.value.trim())).map((value) => (Math.pow(10,(Number(value)/10))))
    console.log('tamanho', potenciasInterferentes.length)
    let somaPotenciasInterferentes = 0
    potenciasInterferentes.map((value)=>{
      somaPotenciasInterferentes += value
    })
    
    const itDb = 10 * Math.log10(somaPotenciasInterferentes) 
    const diDb = 10 * Math.log10(Math.pow(10,-9.5) + Math.pow(10, itDb/10)) + 95
    const margin = PNR - Number(receptionThreshold.value) - function () {return (inputsInterferenceNumberController.value === '0' || inputsInterferenceNumberController.value === '' ) ? 0 : diDb}()
    console.log(PNR, receptionThreshold.value, margin)

    console.log('teste da coisa',diDb)

    setDegradacao(function () {return (inputsInterferenceNumberController.value === '0' || inputsInterferenceNumberController.value === '' ) ? 0 : diDb}())
    setMargem(`${margin}`)
    setPnrDb(`${PNR}`)
  }

  useEffect(()=>{
    frequency.setValue('8')
    kFactor.setValue("0.75")
  },[])
  
  useEffect(() => {
    if(changeOrigin === 'map'){
      towerAInput.setValue(`${originPoint.lat}, ${originPoint.lng}`)
      towerBInput.setValue(`${destinationPoint.lat}, ${destinationPoint.lng}`)
      setChangeOrigin('input')
    }
    calculateAzimuthInDegrees()
  },[originPoint, destinationPoint, changeOrigin])


  useEffect(() => {
    if (originPoint.lat && destinationPoint.lat) {
      const distance = calcularDistanciaHaversine(
        originPoint.lat,
        originPoint.lng,
        destinationPoint.lat,
        destinationPoint.lng,
      )
      setDistanceInMeters(distance)
    }
  }, [originPoint, destinationPoint])

  useEffect(() => {
    async function updateElevationPath() {
      const google = (window as any).google as any
      if (!google?.maps?.ElevationService || !google?.maps?.geometry?.spherical) return
      if (!originPoint.lat || !destinationPoint.lat) return

      const intervalMeters = 500
      const origin = new google.maps.LatLng(originPoint.lat, originPoint.lng)
      const destination = new google.maps.LatLng(destinationPoint.lat, destinationPoint.lng)
      const totalDistance = google.maps.geometry.spherical.computeDistanceBetween(origin, destination)
      const totalSamples = Math.ceil(totalDistance / intervalMeters)
      const MAX_SAMPLES = 512

      function requestElevation(start: any, end: any, samples: number): Promise<any[]> {
        return new Promise((resolve, reject) => {
          const elevator = new google.maps.ElevationService()
          elevator.getElevationAlongPath(
            { path: [start, end], samples },
            (results: any, status: any) => {
              if (status === "OK" && results) {
                resolve(
                  results.map((point: any) => ({
                    lat: point.location.lat(),
                    lng: point.location.lng(),
                    elevation: point.elevation,
                  })),
                )
              } else {
                reject(status)
              }
            },
          )
        })
      }

      let points: any[]
      if (totalSamples <= MAX_SAMPLES) {
        points = await requestElevation(origin, destination, totalSamples)
      } else {
        const segmentCount = Math.ceil(totalSamples / MAX_SAMPLES)
        const results: any[] = []
        for (let i = 0; i < segmentCount; i++) {
          const startFraction = i / segmentCount
          const endFraction = (i + 1) / segmentCount

          const segmentStart = google.maps.geometry.spherical.interpolate(origin, destination, startFraction)
          const segmentEnd = google.maps.geometry.spherical.interpolate(origin, destination, endFraction)
          const segmentDistance = google.maps.geometry.spherical.computeDistanceBetween(segmentStart, segmentEnd)
          const segmentSamples = Math.ceil(segmentDistance / intervalMeters)

          const segmentResult = await requestElevation(segmentStart, segmentEnd, segmentSamples)
          if (i > 0) segmentResult.shift()
          results.push(...segmentResult)
        }
        points = results
      }

      setElevationPath(points)
    }

    updateElevationPath().catch(() => {
      
    })
  }, [originPoint, destinationPoint])

  useEffect(()=>{
    generateSightLine()
  },[elevationPath])

  useEffect(()=>{
    getMaxInterferencePoint()
  },[sightLine])

  useEffect(() =>{
    const d1 = (distanceInMeters - maxInterferencePointDistance) / 1000
    const d2 = maxInterferencePointDistance / 1000
    const K = 4 / 3
    const Hu = (d1 * d2) / (12.7 * K)
    setHu(Hu)

  },[maxInterferencePoint])
  useEffect(()=>{
    const elevation = elevationPath.map((element, index) =>{
      if(index === maxInterferencePointIndex){
        return {...element, elevation: element.elevation + Hu}
      }
      return element
    })
    setelevationPathWithHu(elevation)
    // 
  }, [Hu])
  useEffect(()=>{
    genereteFresnelElipsoid(Number(frequency.value))
  },[elevationPathWithHu])
  useEffect(()=>{
    calculateNoObstructedValues(
      Number(frequency.value),
      twoerAHeight.setValue,
      twoerBHeight.setValue,
      Number(twoerAHeight.value),
      Number(twoerBHeight.value),
      useTecnicalNormCheckbox.checked,
    )
  }, [fresnalElipsoidRatio, useTecnicalNormCheckbox.checked])

  useEffect(() => {
    calculateReflexiveRay(Number(kFactor.value), Math.pow(10, -9))
  }, [destinationPointNoObstructed])

  useEffect(() => {
    if(isFirst) {
      setIsFirst(false)
      return
    }
    mapController.calculateRoughness()
    mapController.calculateRoughnessAtPoint(Number(frequency))
  },[reflexiveRay])
  useEffect(() =>{
    let maxHeight = 0
    for(const element of topFresnelElipsoidNoObstructed){
      if(element.elevation > maxHeight){
        maxHeight = element.elevation
      }
    }
    mapController.setMaxScaleValue(maxHeight + 10)
  }, [topFresnelElipsoidNoObstructed])
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
    inputsNumberController: inputsInterferenceNumberController,
    inputsInterferecePower,
    
    receptionThreshold,
    signalPower,
    connectoLoss,
    cableLoss,
    cableeInMeters,
    gainAntenaA,
    gainAntenaB,
    btnCalculateSafeMargin,
    btnAttFresnelElipsoid,
    roughnessAtPoint,
    midRoughness,
    margem,
    pnrDb,
    menuController,
    useTecnicalNormCheckbox,
    taxaPluviometricaInput,
    horizontalRainAttenuationDb,
    verticalRainAttenuationDb,
    horizontalRainUnavailability,
    verticalRainUnavailability,
    calculateTaxaPluviometricaButton,
    degradacao,
    duplexorLoss,
    technicalReserve,
    calculateDevanecimentoPlano,
    calculateDevanecimentoPlanoButton,
    climaTypeSelect,
    relevoTypeSelect,
    devanecimentoPlano,
    roloffInput,
    tipoRadioclimaSelect,
    calculateDevanecimentoSeletivoButton,
    devanecimentoSeletivo,
    marginWithRainLossVertical,
    marginWithRainLossHorizontal,
    verticalRainViability,
    horizontalRainViability,
    viabilidadeDevanecimento,
    changeOrigin,
    setChangeOrigin
  }
}