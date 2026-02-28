
import { useEffect } from "react";
import ButtonContoller from "./ButtonController";
import { InputController } from "./InputController";
import MapController from "./MapController";

export default function DataController() {
  const towerAInput = InputController("Torre A", true)
  const towerBInput = InputController("Torre B", true)
  const twoerAHeight = InputController("Altura torre A", true)
  const twoerBHeight = InputController('Altura torre B', true)
  const adtionalHeight = InputController("Altura adicional")

  const generateGraphButton = ButtonContoller("Gerar Gráfico", () =>{console.log("teste")})
  const mapController = MapController()

  useEffect(()=>{
    mapController.calculateNoObstructedValues(8, twoerAHeight.setValue, twoerBHeight.setValue)
  }, [mapController.fresnalElipsoidRatio])

  useEffect(() => {
    mapController.calculateReflexiveRay(1.33, 0.75)
  }, [mapController.destinationPointNoObstructed])

  return{
    towerAInput,
    towerBInput,
    twoerAHeight,
    twoerBHeight,
    adtionalHeight,
    generateGraphButton,
    mapController
  }
}