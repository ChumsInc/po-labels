import React, {useEffect, useRef, useState} from 'react';
import PrintCheckbox from "./PrintCheckbox";
import {useDispatch, useSelector} from "react-redux";
import {selectPODetail} from "./selectors";
import {selectAllForPrintingAction, selectForPrintingAction} from "./actions";
import {PurchaseOrderDetail} from "./types";
import {useAppDispatch} from "../../app/configureStore";

function isIndeterminate(detail: PurchaseOrderDetail[]) {
    const qtyChecked = detail.filter(row => row.selected).length;
    return detail.length > 0 && qtyChecked > 0 && qtyChecked !== detail.length;
}

const SelectAllCheckbox: React.FC = () => {
    const dispatch = useAppDispatch();
    const detail = useSelector(selectPODetail);
    const [qtyChecked, setQtyChecked] = useState(detail.filter(row => row.selected).length);
    const [checked, setChecked] = useState<boolean>(qtyChecked > 0 && qtyChecked === detail.length);
    const [indeterminate, setIndeterminate] = useState(isIndeterminate(detail));
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setQtyChecked(detail.filter(row => row.selected).length);
    }, [detail.filter(row => row.selected).length]);

    useEffect(() => {
        setIndeterminate(isIndeterminate(detail));
        setChecked(qtyChecked > 0 && qtyChecked === detail.length)
    }, [qtyChecked]);

    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    const onSelectAll = () => {
        const lineKeys = detail.filter(row => (row.labelData?.labelQuantities || []).length > 0).map(row => row.LineKey);
        dispatch(selectAllForPrintingAction(lineKeys, indeterminate ? false : !checked));
    }

    return (
        <div>
            <PrintCheckbox checked={checked && !indeterminate} onChange={onSelectAll} cbRef={ref}>
                &nbsp;({qtyChecked})
            </PrintCheckbox>
        </div>
    )
}

export default SelectAllCheckbox;
