import type { InputControllerInterface } from '../models/InputController'
import { InputController } from './InputController'

/** Dez campos de potência interferente; hooks estáveis (não usar useState em volta desta lista). */
export function useInterferencePowerControllers(): InputControllerInterface[] {
  const c0 = InputController('Potência [dBm]', false)
  const c1 = InputController('Potência [dBm]', false)
  const c2 = InputController('Potência [dBm]', false)
  const c3 = InputController('Potência [dBm]', false)
  const c4 = InputController('Potência [dBm]', false)
  const c5 = InputController('Potência [dBm]', false)
  const c6 = InputController('Potência [dBm]', false)
  const c7 = InputController('Potência [dBm]', false)
  const c8 = InputController('Potência [dBm]', false)
  const c9 = InputController('Potência [dBm]', false)
  return [c0, c1, c2, c3, c4, c5, c6, c7, c8, c9]
}
