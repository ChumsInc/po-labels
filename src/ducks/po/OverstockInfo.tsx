import React from 'react';
import {POOverstockRecord} from "./types";
import {Badge} from "chums-ducks";
import numeral from "numeral";

export interface OverstockInfoProps {
    overstock?: POOverstockRecord|null,
}

const OverstockInfo:React.FC<OverstockInfoProps> = ({overstock}) => {
    if (!overstock) {
        return null;
    }
    return (
        <div className="d-flex justify-content-between">
            <Badge color="danger" pill>{overstock.OverstockWarehouseCode}</Badge>
            <div className="os-quantity">{numeral(overstock.QuantityOnHand).format('0,0')}</div>
        </div>
    )
}

export default React.memo(OverstockInfo);
