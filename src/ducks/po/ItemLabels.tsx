import React, {ChangeEvent, useEffect, useState} from 'react';
import {useDispatch} from "react-redux";
import {setLabelsAction} from "./actions";

export interface ItemLabelsProps {
    lineKey: string,
    labels: number[],
}

const ItemLabels: React.FC<ItemLabelsProps> = ({lineKey, labels}) => {
    const dispatch = useDispatch();
    const [quantities, setQuantities] = useState([...labels.filter(val => !!val), 0]);

    useEffect(() => {
        setQuantities([...labels.filter(val => !!val), 0]);
    }, [labels])

    const onChangeLabel = (index:number) => (ev:ChangeEvent<HTMLInputElement>) => {
        if (index < 0) {
            setQuantities([...quantities, ev.target.valueAsNumber]);
            return;
        }
        const values = [...quantities];
        values[index] = ev.target.valueAsNumber;
        if (index === values.length - 1) {
            values.push(0);
        }
        setQuantities(values);
    }

    const blurHandler = () => {
        dispatch(setLabelsAction(lineKey, quantities));
    }

    const total = quantities.filter(val => !!val).reduce((pv, cv) => pv + cv, 0);
    return (
        <div className="item-labels">
            {quantities.map((quantity, index) => (
                <input key={index} type="number" className="form-control input-xs" value={quantity || ''}
                       onChange={onChangeLabel(index)} min={1} onBlur={blurHandler}/>
            ))}
            <div className="input-group input-group-sm">
                <div className="input-group-text">Total</div>
                <input className="form-control input-xs" value={total} readOnly disabled />
            </div>
        </div>
    )

}

export default ItemLabels;
