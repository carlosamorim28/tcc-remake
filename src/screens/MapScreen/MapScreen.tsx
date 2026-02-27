import Button from "../../components/Button/Button"
import Input from "../../components/Input/Input"
import Map from "../../components/Map/Map"
import DataController from "../../controllers/DataController"
import "./MapScreen.css"
export default function MapScreen(): React.ReactElement {

  const dataController = DataController()
  
  return (
    <div className='container'>
      <div className='active-collumn' >
        <div className="input-grid">
          <Input controller={dataController.towerAInput} />
        </div>
        <div className="input-grid-heigth">
          <Input controller={dataController.twoerAHeight} />
        </div>
        <div className="input-grid">
          <Input controller={dataController.towerBInput} />
        </div>
        <div className="input-grid-heigth">
          <Input controller={dataController.twoerBHeight} />
        </div>

        <div className="button-grid">
         <Button controller={dataController.generateGraphButton} />
        </div>
      </div>


      <div className='map-collumn'>
        <div className="map-contianer">
          <Map controller={dataController.mapController} />
        </div>
        {/* <Input /> */}

      </div>
    </div>
  )
}