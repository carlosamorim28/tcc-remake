import { useState } from "react"
import type {
  SelectControllerInterface,
  SelectOption,
} from "../models/SelectController"

export function SelectController(
  label: string,
  options: SelectOption[],
  verticalOrientation: boolean = true,
  initialValue: string = "",
): SelectControllerInterface {
  const [value, setValue] = useState(initialValue)
  return { value, setValue, label, options, verticalOrientation }
}

