import React, {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {selectPOLoading, selectPurchaseOrderNo} from "./selectors";
import {Input, SpinnerButton} from "chums-ducks";
import {fetchPurchaseOrderAction, setPurchaseOrderNoAction} from "./actions";

const POInputField: React.FC = () => {
    const dispatch = useDispatch();
    const purchaseOrderNo = useSelector(selectPurchaseOrderNo);
    const loading = useSelector(selectPOLoading);
    const [poNo, setPONo] = useState(purchaseOrderNo);

    useEffect(() => {
        setPONo(purchaseOrderNo);
    }, [purchaseOrderNo]);

    const changeHandler = (ev: ChangeEvent<HTMLInputElement>) => setPONo(ev.target.value);

    const submitHandler = (ev: FormEvent) => {
        ev.preventDefault();
        dispatch(setPurchaseOrderNoAction(poNo.padStart(7, '0')));
        dispatch(fetchPurchaseOrderAction());
    }

    return (
        <form className="input-group input-group-sm" onSubmit={submitHandler}>
            <div className="input-group-text">PO#</div>
            <Input bsSize="sm" value={poNo} onChange={changeHandler} required/>
            <SpinnerButton type="submit" size="sm" color="primary" spinning={loading}>Load</SpinnerButton>
        </form>

    )
}

export default POInputField;
