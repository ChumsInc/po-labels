import {PODetailMap, PurchaseOrder, PurchaseOrderDetail} from "./types";
import {defaultDetailSorter} from "./utils";
import {createReducer} from "@reduxjs/toolkit";
import {
    loadPurchaseOrder, saveLabelDistribution,
    // saveLabelDistributionAction,
    setPORequiredDate,
    setPurchaseOrderNo,
    setReceiptDate,
    toggleCheckedLine
} from "./actions";
import {SortProps} from "chums-components";
import {postLabelDistribution} from "./api";

export interface POState {
    purchaseOrderNo: string;
    purchaseOrder: PurchaseOrder | null;
    detailLines: PODetailMap;
    poLoading: boolean;
    requiredDates: string[];
    selectedDate: string;
    receiptDate: string;
    labelCount: number;
    sort: SortProps<PurchaseOrderDetail>
}

export const initialState: POState = {
    purchaseOrderNo: '',
    purchaseOrder: null,
    detailLines: {},
    poLoading: false,
    requiredDates: [],
    selectedDate: '',
    receiptDate: '',
    labelCount: 0,
    sort: {field: "LineKey", ascending: true},
}

const poReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(setPurchaseOrderNo, (state, action) => {
            state.purchaseOrderNo = action.payload;
        })
        .addCase(setPORequiredDate, (state, action) => {
            state.selectedDate = action.payload;
        })
        .addCase(setReceiptDate, (state, action) => {
            state.receiptDate = action.payload;
        })
        .addCase(loadPurchaseOrder.pending, (state, action) => {
            state.purchaseOrderNo = action.meta.arg;
            state.poLoading = true;
        })
        .addCase(loadPurchaseOrder.fulfilled, (state, action) => {
            state.poLoading = false;
            state.purchaseOrder = action.payload?.purchaseOrder ?? null;
            state.requiredDates = [];
            if (action.payload?.purchaseOrder) {
                const dates: string[] = [];
                state.detailLines = {};
                action.payload.purchaseOrder.detail
                    .forEach(row => {
                        state.detailLines[row.LineKey] = row;
                        if (!dates.includes(row.RequiredDate)) {
                            dates.push(row.RequiredDate);
                        }
                    });
                state.requiredDates = dates.sort();
            }
        })
        .addCase(loadPurchaseOrder.rejected, (state) => {
            state.poLoading = false;
        })
        .addCase(toggleCheckedLine, (state, action) => {
            if (state.purchaseOrder && state.detailLines[action.payload.lineKey]) {
                state.detailLines[action.payload.lineKey].selected = action.payload.checked ?? !state.detailLines[action.payload.lineKey].selected;
            }
        })
        .addCase(saveLabelDistribution.pending, (state, action) => {
            state.poLoading = true;
        })
});
export default poReducer;
