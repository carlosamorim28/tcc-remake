import type DataController from "../../../controllers/DataController";
import './DataSession.css'

export default function DataSession({dataController}: {dataController: ReturnType<typeof DataController>}): React.ReactElement {
  return(
     <div className="active-collumn">
      <span className="data-session-option-line">Distância: {dataController.mapController.distanceInMeters.toFixed(2)} Metros</span>
      <span className="data-session-option-line">Angulo de Azimute: {dataController.mapController.azimuthInDegrees.normal}</span>
      <span className="data-session-option-line">Angulo de Azimute inverso: {dataController.mapController.azimuthInDegrees.inverse}</span>
      <h3 className="data-session-option-line">Ponto de máxima Obstrução:</h3>
      <span className="data-session-option-line">lat {dataController.mapController.maxInterferencePoint.lat} lng {dataController.mapController.maxInterferencePoint.lng}</span>
      <span className="data-session-option-line">Distancia: {dataController.mapController.maxInterferencePointDistance.toFixed(2)}</span>

     </div>
  )
}