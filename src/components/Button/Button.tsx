import type ButtonControllerInterface from '../../models/ButtonController'
import './Button.css'
export default function Button({controller}: {controller: ButtonControllerInterface}) {
  return (
    <div className="button-container">
      <button className="button" onClick={controller.function} >
        {controller.title}
      </button>
    </div>
  )
}