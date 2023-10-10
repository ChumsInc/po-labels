import React, {FormEvent, useState} from 'react';
import {useDispatch} from "react-redux";
import {saveLabelDistribution, setLabelsAction} from "./actions";
import {useAppDispatch} from "../../app/configureStore";
import {PurchaseOrderDetail} from "./types";

export interface LabelStandardQtyInputProps {
    lineKey: string,
    lineQuantity: number,
    disabled?: boolean,
}

const LabelStandardQtyInput:React.FC<LabelStandardQtyInputProps> = ({line, lineKey, lineQuantity, disabled}) => {
    const dispatch = useAppDispatch();

    const [quantity, setQuantity] = useState<number>(0);

    const onCalcLabels = (ev:FormEvent) => {
        ev.preventDefault();
        if (quantity === 0) {
            return;
        }
        let quantityAvailable = lineQuantity;
        const labelQuantities:number[] = [];
        while (quantityAvailable > quantity) {
            labelQuantities.push(quantity);
            quantityAvailable -= quantity;
        }
        if (quantityAvailable > 0) {
            labelQuantities.push(quantityAvailable);
        }
        dispatch(setLabelsAction(lineKey, labelQuantities));
        dispatch(saveLabelDistribution(line));
    }

    const onClearLabels = ()  => {
        if (window.confirm(`Are ytou sure you want to clear labels for line ${lineKey}?`)) {
            dispatch(setLabelsAction(lineKey, []));
            dispatch(saveLabelDistribution(line));
        }
    }

    if (!lineKey || disabled) {
        return null;
    }
    return (
        <form className="input-group input-group-sm std-quantity-input" onSubmit={onCalcLabels}>
            <input type="number" value={quantity || ''} className="form-control form-control-sm"
                   onChange={(ev) => setQuantity(ev.target.valueAsNumber)}
                   min={0} max={lineQuantity} step={1}/>
            <button type="submit" className="btn btn-sm btn-outline-secondary" disabled={!quantity}>
                <span className="bi-gear-wide-connected" />
            </button>
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={onClearLabels}>
                <span className="bi-trash" />
            </button>
        </form>
    )
}

export default React.memo(LabelStandardQtyInput);
