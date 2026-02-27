
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