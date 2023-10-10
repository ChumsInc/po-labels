import React, {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {selectPOLoading, selectPurchaseOrderNo} from "./selectors";
import {Input, SpinnerButton} from "chums-components";

export interface POInputFormProps {
    value: string,
    onChange: (ev:ChangeEvent<HTMLInputElement>) => void,
    onSubmit: (ev: FormEvent) => void,
}

const LoadPOForm: React.FC<POInputFormProps> = ({value, onChange, onSubmit}) => {
    const loading = useSelector(selectPOLoading);

    return (
        <form className="input-group input-group-sm" onSubmit={onSubmit}>
            <div className="input-group-text">PO#</div>
            <Input bsSize="sm" value={value} onChange={onChange} required/>
            <SpinnerButton type="submit" size="sm" color="primary" spinning={loading} disabled={loading}>Load</SpinnerButton>
        </form>
    )
}

export default LoadPOForm;
