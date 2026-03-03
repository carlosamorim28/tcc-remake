import { useState } from "react"
import './Menu.css'
import type { MenuControlleerInterface } from "../../models/MenuControllerInterface"

export function Menu({controller}: {controller: MenuControlleerInterface}): React.ReactElement {
  const {menuOptions, setMenuOptions} = controller
  

  return(
    <div className="container-menu-item">
      {menuOptions.map((item, index) => (
        <div className={`menu-item-container ${item.isSelected && 'menu-item-selected'}`} onClick={() =>{
          const menuOptionsTemporary = menuOptions.map((option)=>({...option, isSelected: false})) 
          menuOptionsTemporary[index].isSelected = true
          setMenuOptions(menuOptionsTemporary)
        }} >
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}