export interface InputControllerInterface {
  value: string;
  setValue: (value: string) => void
  inputLabel: string
  verticalOrientation?: boolean
}