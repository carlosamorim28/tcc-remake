import { useState } from "react";
import type { InputControllerInterface } from "../models/InputController";

export function InputController(inputLabel: string = '', verticalOrientation: boolean = true): InputControllerInterface{
  const [value, setValue] = useState('')
  return {value, setValue, inputLabel, verticalOrientation}
}