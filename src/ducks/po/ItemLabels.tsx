import React, {ChangeEvent, createRef, useEffect, useRef, useState} from 'react';
import {useDispatch} from "react-redux";
import {saveLabelDistributionAction, setLabelsAction} from "./actions";
import {POLabelRecord} from "./types";

export interface ItemLabelsProps {
    lineKey: string,
    labelData?: POLabelRecord,
    quantityOrdered: number,
    disabled?:boolean,
}

const ItemLabels: React.FC<ItemLabelsProps> = ({lineKey, labelData, quantityOrdered, disabled}) => {
    const dispatch = useDispatch();
    const {ReceiptDate: receiptDate, labelQuantities: labels = [], saving, changed: saveRequired} = labelData || {};
    const [quantities, setQuantities] = useState([...labels.filter(val => val > 0)]);
    const [changed, setChanged] = useState(false);
    const [timer, setTimer] = useState(0);
    const inputsRef = useRef<HTMLInputElement[]>([]);

    useEffect(() => {
        window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        setQuantities([...labels.filter(val => val > 0)]);
        setChanged(false);
    }, [labels])

    useEffect(() => {
        const index = inputsRef.current.length - 1;
        if (!!inputsRef.current[index]) {
            inputsRef.current[index].focus();
            inputsRef.current[index].select();
        }
    }, [quantities.length]);

    const saveEntries = () => {
        window.clearTimeout(timer);
        dispatch(saveLabelDistributionAction(lineKey));
    }

    const initSaveEntries = () => {
        window.clearTimeout(timer);
        // const t = window.setTimeout(saveEntries, 1200);
        // setTimer(() => t);
    }

    const onChangeLabel = (index: number) => (ev: ChangeEvent<HTMLInputElement>) => {
        const values = [...quantities];
        values[index] = ev.target.valueAsNumber;
        setQuantities(values);
        setChanged(true);
        initSaveEntries();
    }

    const blurHandler = () => {
        if (changed) {
            dispatch(setLabelsAction(lineKey, quantities.filter(val => !!val)));
            initSaveEntries();
        }
        setChanged(false);
    }

    const onAddLabel = () => {
        const sum = quantities.reduce((cv, pv) => cv + pv, 0);
        if (quantities.includes(0)) {
            return;
        }
        setQuantities([...quantities, Math.max(quantityOrdered - sum, 0)]);
        initSaveEntries();
    }

    const total = quantities.filter(val => !!val).reduce((pv, cv) => pv + cv, 0);
    return (
        <div>
            {!!receiptDate && (<small className="text-muted receipt-date">{new Date(receiptDate).toLocaleDateString()}</small>)}
            <div className="item-labels">
                {quantities.map((quantity, index) => (
                    <div className="input-group input-group-sm" key={index}>
                        <div className="input-group-text">{index + 1}</div>
                        <input key={index} type="number" className="form-control input-xs" value={quantity || ''}
                               ref={el => {
                                   if (el) {
                                       inputsRef.current = [...inputsRef.current, el]
                                   }
                               }}
                               onChange={onChangeLabel(index)} min={1} step={1} onBlur={blurHandler}/>
                    </div>
                ))}
                <button type="button" className="btn btn-xs btn-outline-primary" onClick={onAddLabel}
                        disabled={quantities.includes(0) || disabled}>+</button>
                {saveRequired && (<button type="button" disabled={disabled} className="btn btn-xs btn-outline-success" onClick={saveEntries}>
                    <span className="bi-cloud-upload-fill"/>
                </button>)}
            </div>
        </div>
    )

}

export default ItemLabels;
