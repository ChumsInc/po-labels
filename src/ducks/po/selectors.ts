import {RootState} from "../../app/configureStore";
import {createSelector} from "@reduxjs/toolkit";
import {defaultDetailSorter, detailSorter} from "./utils";
import {POSorterProps, PurchaseOrderDetail} from "./types";
import {Root} from "react-dom/client";

export const tableKey = 'po-detail';


export const selectPurchaseOrderNo = (state:RootState) => state.po.purchaseOrderNo;

export const selectPORequiredDate = (state:RootState) => state.po.selectedDate;

export const selectPORequiredDates = (state:RootState) => state.po.requiredDates;

export const selectPurchaseOrder = (state:RootState) => state.po.purchaseOrder;
export const selectPurchaseOrderDetail = (state:RootState) => state.po.detailLines;

export const selectPOLoading = (state:RootState) => state.po.poLoading;

export const selectPOLabelsLoading = (state:RootState) => state.po.poLoading;

export const selectLabelCount = (state:RootState) => state.po.labelCount;

export const selectDetailSort = (state:RootState) => state.po.sort;

export const selectPODetail = createSelector(
    [selectPORequiredDate, selectPurchaseOrder, selectPurchaseOrderDetail, selectDetailSort],
    (date, po, detail, sort):PurchaseOrderDetail[] => {
    if (!po || !date) {
        return [];
    }
    return Object.values(detail)
        .filter(row => row.RequiredDate === date)
        .sort(detailSorter(sort));
});

export const selectPODetailLine = createSelector(
    [selectPurchaseOrderDetail, (state, lineKey:string) => lineKey],
    (lines, lineKey) => {
        return lines[lineKey] ?? null;
    }
)
// export const selectPODetailLine = (lineKey:string) => (state:RootState):PurchaseOrderDetail|null => {
//     const detail = state.po.purchaseOrder?.detail;
//     if (!detail) {
//         return null;
//     }
//     const [row] = detail.filter(row => row.LineKey === lineKey);
//     return row || null;
// }

export const selectSelectedLineKeys = createSelector([selectPurchaseOrder], (po) => {
    if (!po) {
        return [];
    }
    return po.detail.filter(line => line.selected).map(line => line.LineKey);
})

export const selectReceiptDate = (state:RootState) => state.po.receiptDate;
