export type SelectOption = {
  label: string
  value: string
}

export interface SelectControllerInterface {
  value: string
  setValue: (value: string) => void
  label: string
  options: SelectOption[]
  verticalOrientation?: boolean
}

