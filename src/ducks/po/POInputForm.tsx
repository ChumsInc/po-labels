import React, {ChangeEvent, FormEvent, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {selectPOLoading, selectPORequiredDate, selectPORequiredDates, selectPurchaseOrderNo} from "./selectors";
import {loadPurchaseOrder, genLabelsAction, setPORequiredDate, setPurchaseOrderNo} from "./actions";
import GenerateLabelsForm from "./GenerateLabelsForm";
import LoadPOForm from "./LoadPOForm";
import ClearLabelsButton from "./ClearLabelsButton";
import {useAppDispatch} from "../../app/configureStore";

const POInputForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const purchaseOrderNo = useSelector(selectPurchaseOrderNo);
    const loading = useSelector(selectPOLoading);
    const [poNo, setPONo] = useState(purchaseOrderNo);

    const dates = useSelector(selectPORequiredDates);
    const selected = useSelector(selectPORequiredDate);


    const ref = useRef<HTMLSelectElement>(null);

    useEffect(() => {
        setPONo(purchaseOrderNo);
    }, [purchaseOrderNo]);

    const poChangeHandler = (ev: ChangeEvent<HTMLInputElement>) => setPONo(ev.target.value);

    const dateChangeHandler = async (ev: ChangeEvent<HTMLSelectElement>) => {
        await dispatch(setPORequiredDate(ev.target.value));
        if (ref.current) {
            ref.current.focus();
        }
    }

    const loadSubmitHandler = async (ev: FormEvent) => {
        ev.preventDefault();
        await dispatch(loadPurchaseOrder(poNo.padStart(7, '0')));
        if (ref.current) {
            ref.current.focus();
        }
    }

    const genLabelsSubmitHandler = async (ev:FormEvent) => {
        ev.preventDefault();
        dispatch(genLabelsAction());
    }

    return (
        <div className="row g-3 align-items-baseline">
            <div className="col-auto">
                <LoadPOForm value={poNo} onChange={poChangeHandler} onSubmit={loadSubmitHandler} />
            </div>
            <div className="col-auto">
                <select className="form-select form-select-sm" value={selected} onChange={dateChangeHandler} ref={ref}>
                    <option value="">Select Date</option>
                    {dates.map(date => <option key={date} value={date}>{new Date(date).toLocaleDateString()}</option>)}
                </select>
            </div>
            <div className="col" />

            <div className="col-auto"><ClearLabelsButton /></div>
            <div className="col-auto">
                <GenerateLabelsForm onSubmit={genLabelsSubmitHandler} />
            </div>
        </div>

    )
}

export default POInputForm;
