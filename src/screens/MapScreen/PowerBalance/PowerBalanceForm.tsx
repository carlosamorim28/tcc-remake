import Input from "../../../components/Input/Input";
import type DataController from "../../../controllers/DataController";
import './PowerBalanceForm.css'

export default function PowerBalanceForm({dataController}: {dataController: ReturnType<typeof DataController>}): React.ReactElement {
  return (
    <div className="active-collumn">
      <div className="power-balance-form-container-input-full-width">
        <Input controller={dataController.signalPower} />
      </div>
      <div className="power-balance-form-container-input-2-collumns">
        <Input controller={dataController.gainAntenaA} />
      </div>
      <div className="power-balance-form-container-input-2-collumns">
        <Input controller={dataController.gainAntenaB} />
      </div>
      <div className="power-balance-form-container-input-2-collumns">
        <Input controller={dataController.cableLoss} />
      </div>
      <div className="power-balance-form-container-input-2-collumns">
        <Input controller={dataController.cableeInMeters} />
      </div>
      <div className="power-balance-form-container-input-full-width">
        <Input controller={dataController.connectoLoss} />
      </div>
      
    </div>
  )
}