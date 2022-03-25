import React from 'react';
import {useSelector} from "react-redux";
import {selectPOLoading, selectPurchaseOrder} from "./selectors";
import {Alert, LoadingProgressBar} from "chums-ducks";

const POInfoHeader:React.FC = () => {
    const loading = useSelector(selectPOLoading);
    const po = useSelector(selectPurchaseOrder);

    if (loading) {
        return <LoadingProgressBar striped={true} animated={true} className="mt-3"/>
    }
    if (!po) {
        return <Alert color="info" >Select a purchase order.</Alert>
    }
    return (
        <div className="mt-3">
            <h3 className="d-inline-block me-5">PO# {po.PurchaseOrderNo}</h3>
            <h4 className="d-inline-block me-3">{po.APDivisionNo}-{po.VendorNo}</h4>
            <span>{po.PurchaseName}</span>
        </div>
    )
}
export default POInfoHeader;
