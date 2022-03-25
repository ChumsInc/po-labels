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

export const selectPODetail = createSelector(
    [selectPORequiredDate, selectPurchaseOrder, selectTableSort(tableKey)],
    (date, po, sort):PurchaseOrderDetail[] => {
    if (!po || !date) {
        return [];
    }
    return po.detail
        .filter(row => row.RequiredDate === date)
        .sort(detailSorter(sort as POSorterProps));
});

