import Map from "../../components/Map/Map"
import { Menu } from "../../components/Menu/Menu"
import DataController from "../../controllers/DataController"
import DataSession from "./DataSession/DataSession"
import FlatFadingSession from "./FlatFadingSession/FlatFadingSession"
import GeneralSession from "./GeneralSession/GeneralSession"
import "./MapScreen.css"
import PowerBalanceForm from "./PowerBalance/PowerBalanceForm"
import RainSeession from "./RainSession/RainSession"
import RoughnessSession from "./RoughnessSession/RoughnessSession"
export default function MapScreen(): React.ReactElement {

  const dataController = DataController()
  const menuController = dataController.menuController

  
  return (
    <div className='container'>
      <div className='active-collumn' >
        <div className="active-width">
          <Menu controller={menuController} />
          {menuController.menuOptions[0].isSelected && (
            <GeneralSession dataController={dataController} />
          )}

          {menuController.menuOptions[1].isSelected && (
            <DataSession dataController={dataController} />
          )}
          {menuController.menuOptions[2].isSelected && (
            <RoughnessSession dataController={dataController} />
          )}
          {menuController.menuOptions[3].isSelected && (
            <PowerBalanceForm dataController={dataController} />
          )}
          {menuController.menuOptions[4].isSelected && (
            <RainSeession dataController={dataController} />
          )}
          {menuController.menuOptions[5].isSelected && (
            <FlatFadingSession dataController={dataController} />
          )}
        </div>
      </div>


      <div className='map-collumn'>
        <div className="map-contianer">
          <Map controller={dataController.mapController} />
        </div>
      </div>
    </div>
  )
}