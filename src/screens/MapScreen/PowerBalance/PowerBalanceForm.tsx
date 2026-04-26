import Button from "../../../components/Button/Button";
import DinamicGroupInput from "../../../components/DinamicGroupInput/DinamicGroupInput";
import Input from "../../../components/Input/Input";
import type DataController from "../../../controllers/DataController";
import './PowerBalanceForm.css'

function formatDb(value: number) {
  return Number.isFinite(value) ? `${value.toFixed(2)} dB` : "-"
}

export default function PowerBalanceForm({dataController}: {dataController: ReturnType<typeof DataController>}): React.ReactElement {
  const pnr = Number(dataController.pnrDb)
  const margem = Number(dataController.margem)
  const hasResult = dataController.pnrDb.trim().length > 0 || dataController.margem.trim().length > 0

  return (
    <div className="active-collumn">
      <div className="power-balance-form-container-input-full-width">
        <Input controller={dataController.signalPower} />
      </div>
      <div className="power-balance-form-container-input-full-width">
        <Input controller={dataController.receptionThreshold} />
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

      <div className="power-balance-form-container-input-full-width">
        <DinamicGroupInput inputsInterferecePower={dataController.inputsInterferecePower} inputsNumberController={dataController.inputsNumberController} />
      </div>

      <div className="power-balance-form-container-input-full-width">
        <Button controller={dataController.btnCalculateSafeMargin} />
      </div>

      {hasResult && (
        <div className="power-balance-result-card">
          <div className="power-balance-result-title">Margem de segurança</div>

          <div className="power-balance-result-line">
            <span className="power-balance-result-label">PNR</span>
            <span className="power-balance-result-value">{formatDb(pnr)}</span>
          </div>

          <div className="power-balance-result-line">
            <span className="power-balance-result-label">Margem de segurança</span>
            <span className="power-balance-result-value">{formatDb(margem)}</span>
          </div>
        </div>
      )}
    </div>
  )
}