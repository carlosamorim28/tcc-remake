import React from "react"
import Button from "../../../components/Button/Button"
import Select from "../../../components/Select/Select"
import type DataController from "../../../controllers/DataController"
import "./FlatFadingSession.css"

function formatPf(value: number) {
  return Number.isFinite(value) ? String(value.toFixed(6)) : "-"
}

export default function FlatFadingSession({
  dataController,
}: {
  dataController: ReturnType<typeof DataController>
}): React.ReactElement {
  const hasResult = Number.isFinite(dataController.devanecimentoPlano) && dataController.devanecimentoPlano !== 0

  return (
    <div className="active-collumn">
      <div className="power-balance-form-container-input-2-collumns">
        <Select controller={dataController.climaTypeSelect} />
      </div>
      <div className="power-balance-form-container-input-2-collumns">
        <Select controller={dataController.relevoTypeSelect} />
      </div>

      <div className="power-balance-form-container-input-full-width">
        <Button controller={dataController.calculateDevanecimentoPlanoButton} />
      </div>

      {hasResult && (
        <div className="flat-fading-result-card">
          <div className="flat-fading-result-title">Devanecimento plano</div>
          <div className="flat-fading-result-line">
            <span className="flat-fading-result-label">Pf</span>
            <span className="flat-fading-result-value">
              {formatPf(dataController.devanecimentoPlano)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

