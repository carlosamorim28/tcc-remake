import React from "react"
import Input from "../../../components/Input/Input"
import type DataController from "../../../controllers/DataController"
import Button from "../../../components/Button/Button"
export default function RainSeession({dataController}: {dataController: ReturnType<typeof DataController>}): React.ReactElement {
    return (
    <div className="active-collumn">
        <div className="power-balance-form-container-input-full-width">
            <Input controller={dataController.taxaPluviometricaInput} />
        </div>
        <div className="power-balance-form-container-input-full-width">
            <Button controller={dataController.calculateTaxaPluviometricaButton} />
        </div>
    </div>
    )
}