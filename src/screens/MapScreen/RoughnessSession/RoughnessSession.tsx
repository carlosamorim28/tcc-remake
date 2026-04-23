import Graph from '../../../components/Graph/Graph';
import Checkbox from '../../../components/Checkbox/Checkbox';
import type DataController from '../../../controllers/DataController';
import { calcularDistanciaHaversine } from '../../../helpers/helper';
import  './RoughnessSession.css'

export default function RoughnessSession({dataController}: {dataController: ReturnType<typeof DataController>}): React.ReactElement{
    return (
    <>
        <Checkbox controller={dataController.useTecnicalNormCheckbox} />
        <p>Rugosidade Média: {Math.ceil(dataController.mapController.midRoughness * 100)/ 100}</p>
        <p>Diagnóstico: {dataController.midRoughness < dataController.roughnessAtPoint ? 'Rugoso' : 'Liso'}</p>
        <p>Distância até o ponto de Reflexão: {Math.ceil(calcularDistanciaHaversine(dataController.mapController.originPoint.lat, dataController.mapController.originPoint.lng, dataController.mapController.reflexivePoint.lat, dataController.mapController.reflexivePoint.lng) * 100 / 1000) / (100)  } Km</p>
        <p>Altura do Ponto de reflexão: {Math.ceil(dataController.mapController.reflexivePoint.elevation * 100) / 100} Metros</p>
        <p>Angulo reflexivo: {(dataController.mapController.reflexiveAngle * (180 / Math.PI)).toFixed(3)} Graus</p>
        <p>Area de reflexão: {dataController.mapController.calculateReflexiveArea().toFixed(2)}m²</p>
        <div className="graph-container" >
            <Graph naturalPath={dataController.mapController.elevationPath} straightLine={dataController.mapController.sightLineNoObstructed} bottomFresnelElipsoid={dataController.mapController.bottomFresnelElipsoidNoObstructed} topFresnelElipsoid={dataController.mapController.topFresnelElipsoidNoObstructed} reflexiveRay={dataController.mapController.reflexiveRay} maxYScale={dataController.mapController.maxScaleValue} />
        </div>
    </>

    )
}