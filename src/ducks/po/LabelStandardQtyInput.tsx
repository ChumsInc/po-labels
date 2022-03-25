import React, {useState} from 'react';
import {useDispatch} from "react-redux";
import {setLabelsAction} from "./actions";

export interface LabelStandardQtyInputProps {
    lineKey: string,
    lineQuantity: number,
}

const LabelStandardQtyInput:React.FC<LabelStandardQtyInputProps> = ({lineKey, lineQuantity}) => {
    const dispatch = useDispatch();

    const [quantity, setQuantity] = useState<number>(0);

    const onCalcLabels = () => {
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
    }

    if (!lineKey) {
        return null;
    }
    return (
        <div className="input-group input-group-sm std-quantity-input">
            <input type="number" value={quantity || ''} className="form-control form-control-sm"
                   onChange={(ev) => setQuantity(ev.target.valueAsNumber)}
                   min={0} max={lineQuantity} step={1}/>
            <button type="button" className="btn btn-sm btn-outline-secondary" disabled={!quantity} onClick={onCalcLabels}>
                <span className="bi-gear-wide-connected" />
            </button>
        </div>
    )
}

export default React.memo(LabelStandardQtyInput);
