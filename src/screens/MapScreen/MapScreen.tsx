import Button from "../../components/Button/Button"
import Graph from "../../components/Graph/Graph"
import Input from "../../components/Input/Input"
import Map from "../../components/Map/Map"
import DataController from "../../controllers/DataController"
import "./MapScreen.css"
export default function MapScreen(): React.ReactElement {

  const dataController = DataController()

  function renderMap(): React.ReactElement {
    if(dataController.mapController.sightLine.length > 0 && dataController.mapController.elevationPath.length > 0 ){
      return (
        <></>
      )
    }else {
      return (
        <></>
      )
    }
  }
  
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
        <div className="input-grid">
          <Input controller={dataController.towerAInput} />
        </div>
        <div className="input-grid">
          <Input controller={dataController.frequency} />
        </div>
        <div className="input-grid">
          <Input controller={dataController.kFactor} />
        </div>


        <div className="button-grid">
         <Button controller={dataController.generateGraphButton} />
        </div>
        <div className="graph-container" >
          <Graph naturalPath={dataController.mapController.elevationPath} straightLine={dataController.mapController.sightLine} bottomFresnelElipsoid={dataController.mapController.bottomFresnelElipsoid} topFresnelElipsoid={dataController.mapController.topFresnelElipsoid} reflexiveRay={[]} />
        </div>

        <div className="graph-container" >
          <Graph naturalPath={dataController.mapController.elevationPath} straightLine={dataController.mapController.sightLineNoObstructed} bottomFresnelElipsoid={dataController.mapController.bottomFresnelElipsoidNoObstructed} topFresnelElipsoid={dataController.mapController.topFresnelElipsoidNoObstructed} reflexiveRay={dataController.mapController.reflexiveRay} />
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