import { useState } from "react"
import type CheckboxControllerInterface from "../models/CheckboxController"

export default function CheckboxController(
  label: string,
  initialValue: boolean = false,
): CheckboxControllerInterface {
  const [checked, setChecked] = useState<boolean>(initialValue)
  return { label, checked, setChecked }
}

