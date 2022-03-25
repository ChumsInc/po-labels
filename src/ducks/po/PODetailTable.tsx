import React from 'react';
import {useSelector} from "react-redux";
import {selectPODetail, selectPurchaseOrder, tableKey} from "./selectors";
import numeral from "numeral";
import {Alert, SortableTable} from "chums-ducks";
import LabelDate from "./LabelDate";
import LabelStandardQtyInput from "./LabelStandardQtyInput";
import ItemLabels from "./ItemLabels";
import {PODetailField, PurchaseOrderDetail} from "./types";
import {labelCount} from "./utils";

//@TODO: need to add BTX items,

const tableFields:PODetailField[] = [
    {field: 'selected', title: 'Select', render: (row) => (<span>X</span>)},
    {field: 'LineKey', title: 'Line Key', sortable: true},
    {field: 'WarehouseCode', title: 'Warehouse', sortable: true},
    {field: 'ItemCode', title: 'Item', sortable: true},
    {field: 'ItemCodeDesc', title: 'Description', sortable: true},
    {field: 'RequiredDate', title: 'Req. Date', render: (row) => (<LabelDate date={row.RequiredDate} />)},
    {field: 'QuantityOrdered', title: 'Qty in BTX', render: (row) => (<>@TODO</>)},
    {field: 'QuantityOrdered', title: 'Ordered', sortable: true, className: 'text-end', render: (row) => (<>{numeral(row.QuantityOrdered).format('0,0')}</>)},
    {field: 'QuantityOrdered', title: 'Std Qty', render: (row) => (<LabelStandardQtyInput lineKey={row.LineKey} lineQuantity={row.QuantityOrdered}/>)},
    {field: 'labelData', title: 'Labels', render: (row) => (<ItemLabels lineKey={row.LineKey} labels={row.labelData?.labelQuantities || []} />)},
    {field: 'labelData', title: 'Receipt Date', sortable: true,render: (row) => (<LabelDate date={row.labelData?.ReceiptDate} />)},
    {field: 'QuantityReceived', title: 'Received', sortable: true, className: 'text-end', render: (row) => (<>{numeral(row.QuantityReceived).format('0,0')}</>)},
    {field: 'labelData', title: 'Boxes', className: 'text-end', render: (row:PurchaseOrderDetail) => numeral(labelCount(row)).format('0,0')},
];

const rowClassName = (row:PurchaseOrderDetail) => {
    const labelsTotal = row.labelData?.labelQuantities.filter(val => !!val).reduce((pv, cv) => pv + cv, 0);
    return {
        'text-info': !row.QuantityReceived && labelsTotal === row.QuantityOrdered,
        'text-success': !!row.QuantityReceived && labelsTotal === row.QuantityReceived,
        'text-danger': !!row.QuantityReceived && labelsTotal !== row.QuantityReceived,
    }
}
const PODetailTable: React.FC = () => {
    const po = useSelector(selectPurchaseOrder);
    const detail = useSelector(selectPODetail);
    if (!po) {
        return null;
    }
    return (
        <>
            <SortableTable tableKey={tableKey} className="table-sticky" keyField="LineKey" fields={tableFields} data={detail} rowClassName={rowClassName} />
            {!detail.length && (
                <Alert color="info">Select PO Required Date.</Alert>
            )}
        </>
    )
}

export default PODetailTable;
