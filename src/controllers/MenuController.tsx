import { useState } from "react";
import type { MenuControlleerInterface } from "../models/MenuControllerInterface";

const menuInitialOptions = [
    {label: 'geral', isSelected: true},
    {label: 'Dados do Enlace', isSelected: false},
    {label: 'Rugosidade e Raio Refletido', isSelected: false},
    {label: 'Balanço do potência', isSelected: false},
    {label: 'Atenuação Por Chuva', isSelected: false}
  ]

  export default function MenuController(): MenuControlleerInterface {
    const [menuOptions, setMenuOptions] = useState(menuInitialOptions)

    return {menuOptions, setMenuOptions}
  }