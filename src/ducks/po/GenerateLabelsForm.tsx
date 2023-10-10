import React, {ChangeEvent, FormEvent} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {selectPODetail, selectReceiptDate} from "./selectors";
import {DateInput, SpinnerButton} from "chums-components";
import {setReceiptDate} from "./actions";
import {useAppDispatch} from "../../app/configureStore";

export interface GenerateLabelsFormProps {
    onSubmit: (ev:FormEvent) => void,
}
const GenerateLabelsForm:React.FC<GenerateLabelsFormProps> = ({onSubmit}) => {
    const dispatch = useAppDispatch();
    const receiptDate = useSelector(selectReceiptDate);

    const detail = useSelector(selectPODetail);
    const labels = detail
        .filter(row => row.selected)
        .filter(row => !!(row.labelData?.labelQuantities || []).length)
        .reduce((pv, row) => pv + (row.labelData?.labelQuantities || []).length, 0);

    const receiptDateChangeHandler = (d:Date|null) => {
        dispatch(setReceiptDate(d ? d.toISOString() : ''))
    }

    return (
        <form className="input-group input-group-sm" onSubmit={onSubmit}>
            <div className="input-group-text">
                Rec:
            </div>
            <DateInput className="form-control form-control-sm" value={receiptDate || ''} onChangeDate={receiptDateChangeHandler} />
            <div className="input-group-text">({labels})</div>
            <SpinnerButton type="submit" className="btn btn-sm btn-primary" disabled={labels === 0 || !receiptDate}>Gen Labels</SpinnerButton>
        </form>

    )
}
export default GenerateLabelsForm;
