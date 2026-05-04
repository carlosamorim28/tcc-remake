import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InputController } from '../../../controllers/InputController'
import { useInterferencePowerControllers } from '../../../controllers/useInterferencePowerControllers'
import DinamicGroupInput from '../DinamicGroupInput'

function TestHarness() {
  const inputsNumberController = InputController('Quantidade de Potências interferentes', false)
  const inputsInterferecePower = useInterferencePowerControllers()
  return (
    <DinamicGroupInput
      inputsInterferecePower={inputsInterferecePower}
      inputsNumberController={inputsNumberController}
    />
  )
}

describe('DinamicGroupInput', () => {
  it('permite digitar nas potências interferentes após definir a quantidade', async () => {
    const user = userEvent.setup()
    render(<TestHarness />)

    const textboxes = screen.getAllByRole('textbox')
    expect(textboxes).toHaveLength(1)

    await user.type(textboxes[0], '2')
    const afterQty = screen.getAllByRole('textbox')
    expect(afterQty).toHaveLength(3)

    await user.type(afterQty[1], '-80')
    expect(afterQty[1]).toHaveValue('-80')

    await user.type(afterQty[2], '-90')
    expect(afterQty[2]).toHaveValue('-90')
  })
})
