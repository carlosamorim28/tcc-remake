import type { InputControllerInterface } from '../../models/InputController'
import './Input.css'
export default function Input({controller}: {controller: InputControllerInterface}){
  
  // if(controller.verticalOrientation){
  //   return (
  //   <div className={`input-container vertical`}>
  //     <p>{controller.inputLabel}</p>
  //     <input className='input' value={controller.value} onChange={(e)=>{controller.setValue(e.target.value)}}/>
  //   </div>
  //   )
  // }
  const containerClassName = `input-container ${controller.verticalOrientation ? 'vertical' : ''}`
  return(
    <div className={containerClassName}>
      <p className='label'>{controller.inputLabel}</p>
      <input className='input' value={controller.value} onChange={(e)=>{controller.setValue(e.target.value)}}/>
    </div>
  )
}