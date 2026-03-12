import { useEffect } from 'react'
import { InputController } from '../../controllers/InputController'
import Input from '../Input/Input'
import './DinamicGroupInput.css'
import type { InputControllerInterface } from '../../models/InputController'

export default function DinamicGroupInput({inputsInterferecePower, inputsNumberController}:{inputsNumberController: InputControllerInterface, inputsInterferecePower: InputControllerInterface[] }): React.ReactElement {

  useEffect (() =>{
    inputsNumberController.setValue('0')
  }, [])
  
  return <>
    <Input controller={inputsNumberController} />
    {inputsInterferecePower.map((controller, index) => (index < Number(inputsNumberController.value) && <div className='dinamic-group-input-contaier'> <Input controller={controller} /> </div> ))}
  </>
}