import React from "react"
import Input from "../../../components/Input/Input"
import type DataController from "../../../controllers/DataController"
import Button from "../../../components/Button/Button"
import "./RainSession.css"

function formatDb(value: number) {
  return Number.isFinite(value) ? `${value.toFixed(2)} dB` : "-"
}

/** Exibe indisponibilidade como fração bruta (sem %), parse seguro. */
function formatRawFraction(s: string) {
  const n = Number(s)
  return Number.isFinite(n) ? String(n) : "-"
}

export default function RainSeession({dataController}: {dataController: ReturnType<typeof DataController>}): React.ReactElement {
  const dbH = Number(dataController.horizontalRainAttenuationDb)
  const dbV = Number(dataController.verticalRainAttenuationDb)
  const hasResult =
    dataController.horizontalRainAttenuationDb.trim().length > 0 ||
    dataController.verticalRainAttenuationDb.trim().length > 0 ||
    dataController.horizontalRainUnavailability.trim().length > 0 ||
    dataController.verticalRainUnavailability.trim().length > 0

  return (
    <div className="active-collumn">
      <div className="power-balance-form-container-input-full-width">
        <Input controller={dataController.taxaPluviometricaInput} />
      </div>
      <div className="power-balance-form-container-input-full-width">
        <Button controller={dataController.calculateTaxaPluviometricaButton} />
      </div>
      {hasResult && (
        <div className="rain-session-result-card">
          <div className="rain-session-result-title">Perda por chuva</div>

          <div className="rain-session-result-polarization">
            <div className="rain-session-result-polarization-title">Horizontal</div>
            <div className="rain-session-result-line rain-session-result-line-sub">
              <span className="rain-session-result-label">Atenuação total</span>
              <span className="rain-session-result-value">{formatDb(dbH)}</span>
            </div>
            <div className="rain-session-result-line rain-session-result-line-sub">
              <span className="rain-session-result-label">Indisponibilidade</span>
              <span className="rain-session-result-value rain-session-result-fraction">
                {formatRawFraction(dataController.horizontalRainUnavailability)}
              </span>
            </div>
          </div>

          <div className="rain-session-result-polarization">
            <div className="rain-session-result-polarization-title">Vertical</div>
            <div className="rain-session-result-line rain-session-result-line-sub">
              <span className="rain-session-result-label">Atenuação total</span>
              <span className="rain-session-result-value">{formatDb(dbV)}</span>
            </div>
            <div className="rain-session-result-line rain-session-result-line-sub">
              <span className="rain-session-result-label">Indisponibilidade</span>
              <span className="rain-session-result-value rain-session-result-fraction">
                {formatRawFraction(dataController.verticalRainUnavailability)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
