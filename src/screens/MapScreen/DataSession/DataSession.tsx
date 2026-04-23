import type DataController from "../../../controllers/DataController";
import './DataSession.css'
import Checkbox from "../../../components/Checkbox/Checkbox";

export default function DataSession({dataController}: {dataController: ReturnType<typeof DataController>}): React.ReactElement {
  return(
     <div className="active-collumn">
      <span className="data-session-option-line">Distância: {Math.ceil(dataController.mapController.distanceInMeters * 100 / 1000)/(100)}Km</span>
      <span className="data-session-option-line">Angulo de Azimute: {Math.ceil(dataController.mapController.azimuthInDegrees.normal * 100) / 100}</span>
      <span className="data-session-option-line">Angulo de Azimute inverso: {Math.ceil(dataController.mapController.azimuthInDegrees.inverse * 100) / 100}</span>
      <div className="data-session-option-line">
        <Checkbox controller={dataController.useTecnicalNormCheckbox} />
      </div>
      <h3 className="data-session-option-line">Ponto de máxima Obstrução:</h3>
      <span className="data-session-option-line">lat {dataController.mapController.maxInterferencePoint.lat} lng {dataController.mapController.maxInterferencePoint.lng}</span>
      <span className="data-session-option-line">Distancia: {Math.ceil(dataController.mapController.maxInterferencePointDistance * 100 / 1000) / (100)}Km</span>

     </div>
  )
}