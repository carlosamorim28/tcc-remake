import type DataController from "../controllers/DataController"
import type { SelectControllerInterface } from "../models/SelectController"
import { calcularDistanciaHaversine } from "./helper"

export type ReportRow = { label: string; value: string }
export type ReportSection = { title: string; rows: ReportRow[] }

export type ReportData = {
  isLinkIncomplete: boolean
  sections: ReportSection[]
}

function displayValue(raw: string | number | boolean | undefined): string {
  if (typeof raw === "boolean") return raw ? "Sim" : "Não"
  if (raw === undefined || raw === null) return "-"
  const s = String(raw).trim()
  return s.length > 0 ? s : "-"
}

function formatDb(value: number): string {
  return Number.isFinite(value) ? `${value.toFixed(2)} dBm` : "-"
}

function formatDbAttenuation(value: number): string {
  return Number.isFinite(value) ? `${value.toFixed(2)} dB` : "-"
}

function formatPf(value: number): string {
  return Number.isFinite(value) ? value.toFixed(6) : "-"
}

function formatRawFraction(s: string): string {
  const n = Number(s)
  return Number.isFinite(n) ? String(n) : "-"
}

function formatKmFromMeters(meters: number): string {
  if (!Number.isFinite(meters) || meters <= 0) return "-"
  return `${Math.ceil(meters * 100 / 1000) / 100} km`
}

function formatCoord(lat: number, lng: number): string {
  if (lat === 0 && lng === 0) return "-"
  return `${lat}, ${lng}`
}

function selectDisplayLabel(select: SelectControllerInterface): string {
  const option = select.options.find((o) => o.value === select.value)
  return option?.label ?? displayValue(select.value)
}

function isLinkDefined(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
): boolean {
  const originSet = origin.lat !== 0 || origin.lng !== 0
  const destinationSet = destination.lat !== 0 || destination.lng !== 0
  return originSet && destinationSet
}

export function buildReportSections(
  dataController: ReturnType<typeof DataController>,
): ReportData {
  const { mapController } = dataController
  const {
    originPoint,
    destinationPoint,
    distanceInMeters,
    azimuthInDegrees,
    maxInterferencePoint,
    maxInterferencePointDistance,
    midRoughness,
    roughnessAtPoint,
    reflexivePoint,
    reflexiveAngle,
    calculateReflexiveArea,
  } = mapController

  const isLinkIncomplete = !isLinkDefined(originPoint, destinationPoint)

  const reflexiveDistanceKm =
    originPoint.lat !== 0 || originPoint.lng !== 0
      ? formatKmFromMeters(
          calcularDistanciaHaversine(
            originPoint.lat,
            originPoint.lng,
            reflexivePoint.lat,
            reflexivePoint.lng,
          ),
        )
      : "-"

  const interferenceCount = Math.min(
    10,
    Math.max(0, Number.parseInt(dataController.inputsNumberController.value, 10) || 0),
  )
  const interferenceRows: ReportRow[] = []
  for (let i = 0; i < interferenceCount; i++) {
    const ctrl = dataController.inputsInterferecePower[i]
    interferenceRows.push({
      label: `Interferência ${i + 1}`,
      value: displayValue(ctrl.value),
    })
  }

  const pnr = Number(dataController.pnrDb)
  const margem = Number(dataController.margem)
  const dbH = Number(dataController.horizontalRainAttenuationDb)
  const dbV = Number(dataController.verticalRainAttenuationDb)
  const { ps6, pd, pt } = dataController.devanecimentoSeletivo
  const hasSelectiveResult =
    Number.isFinite(ps6) &&
    Number.isFinite(pd) &&
    Number.isFinite(pt) &&
    (ps6 !== 0 || pd !== 0 || pt !== 0)

  const sections: ReportSection[] = [
    {
      title: "Enlace e torres",
      rows: [
        { label: dataController.towerAInput.inputLabel, value: displayValue(dataController.towerAInput.value) },
        { label: dataController.towerBInput.inputLabel, value: displayValue(dataController.towerBInput.value) },
        { label: dataController.twoerAHeight.inputLabel, value: displayValue(dataController.twoerAHeight.value) },
        { label: dataController.twoerBHeight.inputLabel, value: displayValue(dataController.twoerBHeight.value) },
        { label: dataController.frequency.inputLabel, value: displayValue(dataController.frequency.value) },
        { label: dataController.kFactor.inputLabel, value: displayValue(dataController.kFactor.value) },
        {
          label: dataController.useTecnicalNormCheckbox.label,
          value: displayValue(dataController.useTecnicalNormCheckbox.checked),
        },
      ],
    },
    {
      title: "Geometria do enlace",
      rows: [
        { label: "Distância", value: formatKmFromMeters(distanceInMeters) },
        {
          label: "Ângulo de azimute",
          value:
            distanceInMeters > 0
              ? String(Math.ceil(azimuthInDegrees.normal * 100) / 100)
              : "-",
        },
        {
          label: "Ângulo de azimute inverso",
          value:
            distanceInMeters > 0
              ? String(Math.ceil(azimuthInDegrees.inverse * 100) / 100)
              : "-",
        },
        {
          label: "Ponto de máxima obstrução (lat, lng)",
          value: formatCoord(maxInterferencePoint.lat, maxInterferencePoint.lng),
        },
        {
          label: "Distância até máxima obstrução",
          value: formatKmFromMeters(maxInterferencePointDistance),
        },
      ],
    },
    {
      title: "Rugosidade e reflexão",
      rows: [
        {
          label: "Rugosidade média",
          value:
            midRoughness > 0 || roughnessAtPoint > 0
              ? String(Math.ceil(midRoughness * 100) / 100)
              : "-",
        },
        {
          label: "Tipo de relevo",
          value:
            midRoughness > 0 || roughnessAtPoint > 0
              ? midRoughness < roughnessAtPoint
                ? "Rugoso"
                : "Liso"
              : "-",
        },
        { label: "Distância até ponto de reflexão", value: reflexiveDistanceKm },
        {
          label: "Altura do ponto de reflexão",
          value:
            reflexivePoint.elevation > 0
              ? `${Math.ceil(reflexivePoint.elevation * 100) / 100} m`
              : "-",
        },
        {
          label: "Ângulo reflexivo",
          value:
            reflexiveAngle !== 0
              ? `${(reflexiveAngle * (180 / Math.PI)).toFixed(3)}°`
              : "-",
        },
        {
          label: "Área de reflexão",
          value:
            reflexivePoint.lat !== 0 || reflexivePoint.lng !== 0
              ? `${calculateReflexiveArea().toFixed(2)} m²`
              : "-",
        },
      ],
    },
    {
      title: "Balanço de potência — parâmetros",
      rows: [
        { label: dataController.signalPower.inputLabel, value: displayValue(dataController.signalPower.value) },
        {
          label: dataController.receptionThreshold.inputLabel,
          value: displayValue(dataController.receptionThreshold.value),
        },
        { label: dataController.gainAntenaA.inputLabel, value: displayValue(dataController.gainAntenaA.value) },
        { label: dataController.gainAntenaB.inputLabel, value: displayValue(dataController.gainAntenaB.value) },
        {
          label: dataController.cableeInMeters.inputLabel,
          value: displayValue(dataController.cableeInMeters.value),
        },
        {
          label: dataController.technicalReserve.inputLabel,
          value: displayValue(dataController.technicalReserve.value),
        },
        { label: dataController.cableLoss.inputLabel, value: displayValue(dataController.cableLoss.value) },
        { label: dataController.connectoLoss.inputLabel, value: displayValue(dataController.connectoLoss.value) },
        { label: dataController.duplexorLoss.inputLabel, value: displayValue(dataController.duplexorLoss.value) },
        {
          label: dataController.inputsNumberController.inputLabel,
          value: displayValue(dataController.inputsNumberController.value),
        },
        ...interferenceRows,
      ],
    },
    {
      title: "Balanço de potência — resultados",
      rows: [
        {
          label: "Potência nominal de recepção",
          value: dataController.pnrDb.trim() ? formatDb(pnr) : "-",
        },
        {
          label: "Limiar degradado",
          value: Number.isFinite(dataController.degradacao) ? formatDb(dataController.degradacao) : "-",
        },
        {
          label: "Margem de segurança",
          value: dataController.margem.trim() ? formatDb(margem) : "-",
        },
      ],
    },
    {
      title: "Atenuação por chuva",
      rows: [
        {
          label: dataController.taxaPluviometricaInput.inputLabel,
          value: displayValue(dataController.taxaPluviometricaInput.value),
        },
        {
          label: "Atenuação total (horizontal)",
          value: dataController.horizontalRainAttenuationDb.trim()
            ? formatDbAttenuation(dbH)
            : "-",
        },
        {
          label: "Indisponibilidade (horizontal)",
          value: formatRawFraction(Number(dataController.horizontalRainUnavailability).toFixed(3).toString()),
        },
        {
          label: "Margem degradada por chuva (horizontal)",
          value: displayValue(Number(dataController.marginWithRainLossHorizontal).toFixed(3)),
        },
        {
          label: "Viabilidade (horizontal)",
          value: displayValue(Number(dataController.horizontalRainViability).toFixed(3).toString()),
        },
        {
          label: "Atenuação total (vertical)",
          value: dataController.verticalRainAttenuationDb.trim()
            ? formatDbAttenuation(dbV)
            : "-",
        },
        {
          label: "Indisponibilidade (vertical)",
          value: formatRawFraction(Number(dataController.verticalRainUnavailability).toFixed(3).toString()),
        },
        {
          label: "Margem degradada por chuva (vertical)",
          value: displayValue(Number(dataController.marginWithRainLossVertical).toFixed(3).toString()),
        },
        {
          label: "Viabilidade (vertical)",
          value: displayValue(dataController.verticalRainViability),
        },
      ],
    },
    {
      title: "Devanecimento",
      rows: [
        { label: dataController.climaTypeSelect.label, value: selectDisplayLabel(dataController.climaTypeSelect) },
        { label: dataController.relevoTypeSelect.label, value: selectDisplayLabel(dataController.relevoTypeSelect) },
        {
          label: dataController.tipoRadioclimaSelect.label,
          value: selectDisplayLabel(dataController.tipoRadioclimaSelect),
        },
        { label: dataController.roloffInput.inputLabel, value: displayValue(dataController.roloffInput.value) },
        {
          label: "Devanecimento plano (Pf)",
          value:
            Number.isFinite(dataController.devanecimentoPlano) &&
            dataController.devanecimentoPlano !== 0
              ? formatPf(dataController.devanecimentoPlano)
              : "-",
        },
        {
          label: "Devanecimento seletivo (Ps6)",
          value: hasSelectiveResult ? formatPf(ps6) : "-",
        },
        {
          label: "Devanecimento seletivo (Pd)",
          value: hasSelectiveResult ? formatPf(pd) : "-",
        },
        {
          label: "Devanecimento seletivo (Pt)",
          value: hasSelectiveResult ? formatPf(pt) : "-",
        },
        {
          label: "Viabilidade do devanecimento",
          value: displayValue(dataController.viabilidadeDevanecimento),
        },
      ],
    },
  ]

  return { isLinkIncomplete, sections }
}
