import {POSorterProps, PurchaseOrderDetail} from "./types";
import {SortProps} from "chums-components";


export const detailSorter = ({field, ascending}:SortProps<PurchaseOrderDetail>) => (a:PurchaseOrderDetail, b:PurchaseOrderDetail) => {
    switch (field) {
    case 'QuantityOrdered':
    case 'QuantityReceived':
    case 'UnitOfMeasureConvFactor':
        return (a[field] - b[field]) * (ascending ? 1 : -1);
    case 'overstock':
        return ((a.overstock?.QuantityOnHand || 0) - (b.overstock?.QuantityOnHand || 0)) * (ascending ? 1 : -1);
    case 'labelData':
    case 'selected':
        return 0;
    default:
        const aVal = (a[field] || '').toLowerCase();
        const bVal = (b[field] || '').toLowerCase();

        return (aVal === bVal ? (a.LineKey > b.LineKey ? 1 : -1) : (aVal > bVal ? 1 : -1)) * (ascending ? 1 : -1);
    }
}

export const defaultDetailSorter = (a:PurchaseOrderDetail, b:PurchaseOrderDetail) => {
    return a.LineKey > b.LineKey ? 1 : -1;
}

export const labelCount = (row:PurchaseOrderDetail) => row.labelData?.labelQuantities.filter(qty => qty > 0).length || 0;
