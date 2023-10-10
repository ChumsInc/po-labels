import React, {ChangeEvent} from 'react';
import {Select} from "chums-components";
import {useDispatch, useSelector} from "react-redux";
import {selectPORequiredDate, selectPORequiredDates} from "./selectors";
import {setPORequiredDate} from "./actions";
import {useAppDispatch} from "../../app/configureStore";

const PODateSelect:React.FC = () => {
    const dispatch = useAppDispatch();
    const dates = useSelector(selectPORequiredDates);
    const selected = useSelector(selectPORequiredDate);

    const changeHandler = (ev:ChangeEvent<HTMLSelectElement>) => {
        dispatch(setPORequiredDate(ev.target.value));
    }
    return (
        <Select value={selected} onChange={changeHandler} bsSize="sm" >
            <option value="">Select Date</option>
            {dates.map(date => <option key={date} value={date}>{new Date(date).toLocaleDateString()}</option>)}
        </Select>
    )
}

export default PODateSelect;
