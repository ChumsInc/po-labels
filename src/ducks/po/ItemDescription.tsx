import React from 'react';
import {PurchaseOrderDetail} from "./types";
import {Badge} from "chums-components";

export interface ItemDescriptionProps {
   row:PurchaseOrderDetail,
}

const ItemDescription:React.FC<ItemDescriptionProps> = ({row}) => {
    const {ItemCodeDesc, CommentText, WorkOrderNo} = row;
    return (
        <div>
            <div>{ItemCodeDesc}</div>
            <small className="text-muted">{CommentText}</small>
            {!!WorkOrderNo && (<div><Badge color="warning" className="text-dark">WO: {WorkOrderNo}</Badge></div>)}
        </div>
    )
}

export default ItemDescription;
