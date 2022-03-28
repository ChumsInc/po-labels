import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {selectSelectedLineKeys} from "./selectors";
import {selectForPrintingAction} from "./actions";
import PrintCheckbox from "./PrintCheckbox";

export interface SelectForPrintingCheckboxProps {
    lineKey: string,
    disabled?: boolean,
}

const SelectForPrintingCheckbox: React.FC<SelectForPrintingCheckboxProps> = ({lineKey, disabled}) => {
    const dispatch = useDispatch();
    const lines = useSelector(selectSelectedLineKeys);
    const checked = lines.includes(lineKey);
    const changeHandler = () => {
        if (disabled) {
            return;
        }
        dispatch(selectForPrintingAction(lineKey, !checked));
    }
    return (
        <PrintCheckbox checked={checked} disabled={disabled} onChange={changeHandler}/>
    )

};

export default React.memo(SelectForPrintingCheckbox);
