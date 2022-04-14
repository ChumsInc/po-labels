import {RootState} from "../index";
import {createSelector} from "reselect";
import {defaultDetailSorter, detailSorter} from "./utils";
import {POSorterProps, PurchaseOrderDetail} from "./types";
import {selectTableSort} from "chums-ducks";

export const tableKey = 'po-detail';


export const selectPurchaseOrderNo = (state:RootState) => state.po.purchaseOrderNo;

export const selectPORequiredDate = (state:RootState) => state.po.selectedDate;

export const selectPORequiredDates = (state:RootState) => state.po.requiredDates;

export const selectPurchaseOrder = (state:RootState) => state.po.purchaseOrder;

export const selectPOLoading = (state:RootState) => state.po.poLoading;

export const selectPOLabelsLoading = (state:RootState) => state.po.poLabelsLoading;

export const selectLabelCount = (state:RootState) => state.po.labelCount;

export const selectPODetail = createSelector(
    [selectPORequiredDate, selectPurchaseOrder, selectTableSort(tableKey)],
    (date, po, sort):PurchaseOrderDetail[] => {
    if (!po || !date) {
        return [];
    }
    return po.detail
        // .filter(row => row.ItemType === '1')
        .filter(row => row.RequiredDate === date)
        .sort(detailSorter(sort as POSorterProps));
});

export const selectPODetailLine = (lineKey:string) => (state:RootState):PurchaseOrderDetail|null => {
    const detail = state.po.purchaseOrder?.detail;
    if (!detail) {
        return null;
    }
    const [row] = detail.filter(row => row.LineKey === lineKey);
    return row || null;
}

export const selectSelectedLineKeys = createSelector([selectPurchaseOrder], (po) => {
    if (!po) {
        return [];
    }
    return po.detail.filter(line => line.selected).map(line => line.LineKey);
})

export const selectReceiptDate = (state:RootState) => state.po.receiptDate;
