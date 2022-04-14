import React, {useEffect} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {selectPODetail, selectPurchaseOrder, tableKey} from "./selectors";
import numeral from "numeral";
import {Alert, SortableTable, tableAddedAction} from "chums-ducks";
import LabelDate from "./LabelDate";
import LabelStandardQtyInput from "./LabelStandardQtyInput";
import ItemLabels from "./ItemLabels";
import {PODetailField, PurchaseOrderDetail} from "./types";
import {labelCount} from "./utils";
import OverstockInfo from "./OverstockInfo";
import SelectForPrintingCheckbox from "./SelectForPrintingCheckbox";
import SelectAllCheckbox from "./SelectAllCheckbox";
import ItemDescription from "./ItemDescription";
import LabelTotalInfo from "./LabelTotalInfo";

//@TODO: need to add BTX items,

const tableFields:PODetailField[] = [
    {field: 'selected', title: (<SelectAllCheckbox />),
        render: (row:PurchaseOrderDetail) => (<SelectForPrintingCheckbox lineKey={row.LineKey} disabled={!row.labelData?.labelQuantities.length || row.ItemType !== '1'} />)},
    {field: 'LineKey', title: 'Line Key', sortable: true},
    {field: 'WarehouseCode', title: 'Warehouse', sortable: true},
    {field: 'ItemCode', title: 'Item', sortable: true},
    {field: 'ItemCodeDesc', title: 'Description', sortable: true, render: (row) => (<ItemDescription row={row}/>)},
    // {field: 'RequiredDate', title: 'Req. Date', render: (row) => (<LabelDate date={row.RequiredDate} />)},
    {field: 'overstock', title: 'Qty in BTX', render: (row:PurchaseOrderDetail) => (<OverstockInfo overstock={row.overstock} />), sortable: true},
    {field: 'QuantityOrdered', title: 'Ordered', sortable: true, className: 'text-end', render: (row) => (<>{numeral(row.QuantityOrdered).format('0,0')}</>)},
    {field: 'QuantityOrdered', title: 'Std Qty', render: (row) => (<LabelStandardQtyInput disabled={row.ItemType !== '1'} lineKey={row.LineKey} lineQuantity={row.QuantityReceived ? row.QuantityReceived : row.QuantityOrdered}/>)},
    {field: 'labelData', title: 'Box Labels', render: (row) => (<ItemLabels disabled={row.ItemType !== '1'} lineKey={row.LineKey} labelData={row.labelData} quantityOrdered={row.QuantityOrdered} />)},
    {field: 'labelData', title: 'Label Total', render: (row) => (<LabelTotalInfo labelData={row.labelData}/>)},
    {field: 'labelData', title: 'Receipt Date', sortable: true,render: (row) => (<LabelDate date={row.labelData?.ReceiptDate} />)},
    {field: 'QuantityReceived', title: 'Received', sortable: true, className: 'text-end', render: (row) => (<>{numeral(row.QuantityReceived).format('0,0')}</>)},
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
    const dispatch = useDispatch();
    const po = useSelector(selectPurchaseOrder);
    const detail = useSelector(selectPODetail);
    useEffect(() => {
        dispatch(tableAddedAction({key: tableKey, field: 'LineKey', ascending: true}));
    }, [])
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
