import React, {ChangeEvent} from "react";
import {useDispatch, useSelector} from "react-redux";
import {selectSelectedLineKeys} from "./selectors";
import {selectForPrintingAction, toggleCheckedLine} from "./actions";
import PrintCheckbox from "./PrintCheckbox";
import {useAppDispatch} from "../../app/configureStore";
import {ToggleCheckedLine} from "./types";

export interface SelectForPrintingCheckboxProps {
    lineKey: string,
    disabled?: boolean,
}

const SelectForPrintingCheckbox = ({lineKey, disabled}: SelectForPrintingCheckboxProps) => {
    const dispatch = useAppDispatch();
    const lines = useSelector(selectSelectedLineKeys);
    const checked = lines.includes(lineKey);
    const changeHandler = (ev:ChangeEvent<HTMLInputElement>) => {
        if (disabled) {
            return;
        }
        const arg:ToggleCheckedLine = {lineKey, checked: ev.target.checked};
        dispatch(toggleCheckedLine(arg));
    }
    return (
        <PrintCheckbox checked={checked} disabled={disabled} onChange={changeHandler}/>
    )

};

export default React.memo(SelectForPrintingCheckbox);
