import Input from "../../../components/Input/Input";
import Button from "../../../components/Button/Button";
import Graph from "../../../components/Graph/Graph";
import type DataController from "../../../controllers/DataController";

export default function GeneralSession ({dataController}: {dataController: ReturnType<typeof DataController>}): React.ReactElement {

  return (
    <div className="active-collumn">
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
          <Input controller={dataController.frequency} />
        </div>
        <div className="input-grid">
          <Input controller={dataController.kFactor} />
        </div>


        <div className="button-grid">
         <Button controller={dataController.generateGraphButton} />
        </div>
        <div className="button-grid">
         <Button controller={dataController.btnAttFresnelElipsoid} />
        </div>

        <div className="graph-container" >
          <Graph naturalPath={dataController.mapController.elevationPath} straightLine={dataController.mapController.sightLine} bottomFresnelElipsoid={dataController.mapController.bottomFresnelElipsoid} topFresnelElipsoid={dataController.mapController.topFresnelElipsoid} reflexiveRay={[]} />
        </div>

        <div className="graph-container" >
          <Graph naturalPath={dataController.mapController.elevationPath} straightLine={dataController.mapController.sightLineNoObstructed} bottomFresnelElipsoid={dataController.mapController.bottomFresnelElipsoidNoObstructed} topFresnelElipsoid={dataController.mapController.topFresnelElipsoidNoObstructed} reflexiveRay={dataController.mapController.reflexiveRay} />
        </div>
    </div>
  )
}