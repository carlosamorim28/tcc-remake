import React from "react"
import Button from "../../../components/Button/Button"
import Input from "../../../components/Input/Input"
import Select from "../../../components/Select/Select"
import type DataController from "../../../controllers/DataController"
import "../FlatFadingSession/FlatFadingSession.css"

function formatValue(value: number) {
  return Number.isFinite(value) ? String(value.toFixed(6)) : "-"
}

export default function SelectiveFadingSession({
  dataController,
}: {
  dataController: ReturnType<typeof DataController>
}): React.ReactElement {
  const { ps6, pd, pt } = dataController.devanecimentoSeletivo
  const hasPf =
    Number.isFinite(dataController.devanecimentoPlano) && dataController.devanecimentoPlano !== 0
  const hasResult =
    Number.isFinite(ps6) && Number.isFinite(pd) && Number.isFinite(pt) && (ps6 !== 0 || pd !== 0 || pt !== 0)

  return (
    <div className="active-collumn">
      <div className="power-balance-form-container-input-2-collumns">
        <Input controller={dataController.roloffInput} />
      </div>
      <div className="power-balance-form-container-input-2-collumns">
        <Select controller={dataController.tipoRadioclimaSelect} />
      </div>

      {!hasPf && (
        <div className="flat-fading-result-card">
          <div className="flat-fading-result-title">Pf necessário</div>
          <div className="flat-fading-result-line">
            <span className="flat-fading-result-label">
              Calcule o devanecimento plano na aba anterior antes de continuar.
            </span>
          </div>
        </div>
      )}

      {hasPf && (
        <div className="flat-fading-result-card">
          <div className="flat-fading-result-title">Devanecimento plano (Pf)</div>
          <div className="flat-fading-result-line">
            <span className="flat-fading-result-label">Pf</span>
            <span className="flat-fading-result-value">
              {formatValue(dataController.devanecimentoPlano)}
            </span>
          </div>
        </div>
      )}

      <div className="power-balance-form-container-input-full-width">
        <Button controller={dataController.calculateDevanecimentoSeletivoButton} />
      </div>

      {hasResult && (
        <div className="flat-fading-result-card">
          <div className="flat-fading-result-title">Devanecimento seletivo</div>
          <div className="flat-fading-result-line">
            <span className="flat-fading-result-label">Ps6</span>
            <span className="flat-fading-result-value">{formatValue(ps6)}</span>
          </div>
          <div className="flat-fading-result-line">
            <span className="flat-fading-result-label">Pd</span>
            <span className="flat-fading-result-value">{formatValue(pd)}</span>
          </div>
          <div className="flat-fading-result-line">
            <span className="flat-fading-result-label">Pt</span>
            <span className="flat-fading-result-value">{formatValue(pt)}</span>
          </div>
          <div className="flat-fading-result-line">
            <span className="flat-fading-result-label">Viabilidade</span>
            <span className="flat-fading-result-value">{dataController.viabilidadeDevanecimento}</span>
          </div>
        </div>
      )}
    </div>
  )
}
