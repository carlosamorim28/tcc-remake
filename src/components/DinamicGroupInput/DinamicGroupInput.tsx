import type { ReactElement } from 'react'
import Input from '../Input/Input'
import './DinamicGroupInput.css'
import type { InputControllerInterface } from '../../models/InputController'

export default function DinamicGroupInput({inputsInterferecePower, inputsNumberController}:{inputsNumberController: InputControllerInterface, inputsInterferecePower: InputControllerInterface[] }): ReactElement {
  return <>
    <Input controller={inputsNumberController} />
    {inputsInterferecePower.map((controller, index) =>
      index < Number(inputsNumberController.value) ? (
        <div key={index} className='dinamic-group-input-contaier'>
          <Input controller={controller} />
        </div>
      ) : null,
    )}
  </>
}
