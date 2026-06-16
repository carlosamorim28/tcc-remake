import { useEffect, useMemo } from "react"
import Button from "../../../components/Button/Button"
import Graph from "../../../components/Graph/Graph"
import ButtonContoller from "../../../controllers/ButtonController"
import type DataController from "../../../controllers/DataController"
import { buildReportSections } from "../../../helpers/buildReportSections"
import "./ReportSession.css"

const PRINT_BODY_CLASS = "print-report-mode"

function handlePrint() {
  document.body.classList.add(PRINT_BODY_CLASS)
  requestAnimationFrame(() => window.print())
}

export default function ReportSession({
  dataController,
}: {
  dataController: ReturnType<typeof DataController>
}): React.ReactElement {
  const generatedAt = useMemo(() => new Date().toLocaleString("pt-BR"), [])
  const report = useMemo(() => buildReportSections(dataController), [dataController])
  const projectName = dataController.projectNameInput.value.trim()
  const reportTitle = projectName
    ? `Relatório técnico — ${projectName}`
    : "Relatório técnico — Enlace MW"
  const printButton = useMemo(() => ButtonContoller("Imprimir relatório", handlePrint), [])

  useEffect(() => {
    const removePrintClass = () => {
      document.body.classList.remove(PRINT_BODY_CLASS)
    }
    window.addEventListener("afterprint", removePrintClass)
    return () => {
      window.removeEventListener("afterprint", removePrintClass)
      document.body.classList.remove(PRINT_BODY_CLASS)
    }
  }, [])

  return (
    <div className="active-collumn report-session-root">
      <header className="report-session-header">
        <h2 className="report-session-title">{reportTitle}</h2>
        <p className="report-session-generated-at">Gerado em {generatedAt}</p>
      </header>

      {report.isLinkIncomplete && (
        <p className="report-session-warning" role="status">
          Enlace incompleto: defina as torres A e B no mapa para preencher geometria e cálculos
          dependentes do percurso.
        </p>
      )}

      <div className="report-session-actions">
        <Button controller={printButton} />
      </div>

      {report.sections.map((section) => (
        <section key={section.title} className="report-session-card" aria-labelledby={section.title}>
          <div className="report-session-card-title" id={section.title}>
            {section.title}
          </div>
          {section.rows.map((row) => (
            <div key={`${section.title}-${row.label}`} className="report-session-row">
              <span className="report-session-label">{row.label}</span>
              <span className="report-session-value">{row.value}</span>
            </div>
          ))}
        </section>
      ))}

      <section className="report-session-card report-session-graph-card" aria-labelledby="report-graph-title">
        <div className="report-session-card-title" id="report-graph-title">
          Perfil do enlace
        </div>
        <div className="report-session-graph-container">
          <Graph
            naturalPath={dataController.mapController.elevationPathWithHu}
            straightLine={dataController.mapController.sightLineNoObstructed}
            bottomFresnelElipsoid={dataController.mapController.bottomFresnelElipsoidNoObstructed}
            topFresnelElipsoid={dataController.mapController.topFresnelElipsoidNoObstructed}
            reflexiveRay={dataController.mapController.reflexiveRay}
            highlightIndex={dataController.mapController.maxInterferencePointIndex}
            maxYScale={dataController.mapController.maxScaleValue}
          />
        </div>
      </section>
    </div>
  )
}
