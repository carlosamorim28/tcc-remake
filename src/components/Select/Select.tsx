import type { SelectControllerInterface } from "../../models/SelectController"
import "./Select.css"

export default function Select({
  controller,
}: {
  controller: SelectControllerInterface
}) {
  const containerClassName = `input-container ${controller.verticalOrientation ? "vertical" : ""}`
  return (
    <div className={containerClassName}>
      <p className="label">{controller.label}</p>
      <select
        className="input select-input"
        value={controller.value}
        onChange={(e) => controller.setValue(e.target.value)}
      >
        <option value="" disabled>
          Selecione...
        </option>
        {controller.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

