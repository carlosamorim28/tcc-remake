import type CheckboxControllerInterface from "../../models/CheckboxController"
import "./Checkbox.css"

type Props = {
  controller: CheckboxControllerInterface
}

export default function Checkbox({ controller }: Props) {
  return (
    <div className="checkbox-container">
      <input
        className="checkbox-input"
        type="checkbox"
        checked={controller.checked}
        onChange={(e) => controller.setChecked(e.target.checked)}
      />
      <p className="checkbox-label">{controller.label}</p>
    </div>
  )
}

