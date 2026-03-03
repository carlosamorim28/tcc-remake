export interface MenuControlleerInterface {
  menuOptions: {label: string, isSelected: boolean}[],
  setMenuOptions: (value: {label: string, isSelected: boolean}[]) => void
}