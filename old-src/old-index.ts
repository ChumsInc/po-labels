import {PurchaseOrder} from "../src/ducks/po/types";
import {
    clearLabelsSucceeded,
    fetchFailed,
    fetchLabelCountSucceeded,
    fetchLabelDistributionFailed,
    fetchLabelDistributionRequested,
    fetchLabelDistributionSucceeded,
    fetchRequested,
    fetchSucceeded,
    saveLabelDistributionRequested,
    saveLabelDistributionSucceeded,
    selectForPrinting,
    setLabelQuantities,
} from "../src/ducks/po/actionTypes";
import {defaultDetailSorter} from "../src/ducks/po/utils";
import {createReducer} from "@reduxjs/toolkit";
import {loadPurchaseOrder, setPORequiredDate, setPurchaseOrderNo, setReceiptDate, toggleCheckedLine} from "../src/ducks/po/actions";

export interface POState {
    purchaseOrderNo: string;
    purchaseOrder: PurchaseOrder | null;
    poLoading: boolean;
    requiredDates: string[];
    selectedDate: string;
    receiptDate: string;
    labelCount: number;
}

export const initialState: POState = {
    purchaseOrderNo: '',
    purchaseOrder: null,
    poLoading: false,
    requiredDates: [],
    selectedDate: '',
    receiptDate: '',
    labelCount: 0,
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
                action.payload.purchaseOrder.detail
                    .forEach(row => {
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
            if (state.purchaseOrder) {
                const detail = [
                    ...state.purchaseOrder.detail.filter(line => line.LineKey !== action.payload.lineKey),
                    ...state.purchaseOrder.detail.filter(line => line.LineKey === action.payload.lineKey)
                        .map(line => ({...line, selected: action.payload.checked ?? !line.selected}))
                ].sort(defaultDetailSorter);
            }
        })
});
export default poReducer;

const purchaseOrderNoReducer = (state: string = '', action: POAction): string => {
    const {type, payload} = action;
    switch (type) {
        case fetchSucceeded:
            return payload?.purchaseOrder?.PurchaseOrderNo || '';
        default:
            return state;
    }
}

const purchaseOrderReducer = (state: PurchaseOrder | null = null, action: POAction): PurchaseOrder | null => {
    const {type, payload} = action;
    switch (type) {
        case fetchSucceeded:
            if (payload?.purchaseOrder) {
                return payload.purchaseOrder;
            }
            return null;
        case fetchLabelDistributionSucceeded:
            if (state && payload?.labels) {
                const labels = payload.labels;
                const detail = state.detail.map(row => {
                    const [labelData] = labels.filter(label => label.LineKey === row.LineKey)
                    row.labelData = labelData;
                    return row;
                }).sort(defaultDetailSorter);
                return {...state, detail};
            }
            return state;
        case setLabelQuantities:
            if (state && payload?.lineKey && payload?.labelQuantities) {
                const detail = [
                    ...state.detail.filter(row => row.LineKey === payload.lineKey).map(row => {
                        if (!row.labelData) {
                            row.labelData = {
                                company: 'CHI',
                                PurchaseOrderNo: state.PurchaseOrderNo,
                                LineKey: row.LineKey,
                                ReceiptDate: new Date().toISOString(),
                                labelQuantities: [],
                            }
                        }
                        row.labelData.labelQuantities = payload.labelQuantities || [];
                        row.labelData.changed = true;
                        return row;
                    }),
                    ...state.detail.filter(row => row.LineKey !== payload.lineKey),
                ].sort(defaultDetailSorter);
                return {...state, detail};
            }
            return state;
        case selectForPrinting:
            if (state && payload?.lineKey) {
                const detail = [
                    ...state.detail
                        .filter(row => row.LineKey === payload.lineKey)
                        .map(row => {
                            return {...row, selected: payload.selected};
                        }),
                    ...state.detail.filter(row => row.LineKey !== payload.lineKey),
                ].sort(defaultDetailSorter);
                return {...state, detail};
            }
            if (state && payload?.lineKeys) {
                const lineKeys = payload.lineKeys;
                const detail = [
                    ...state.detail
                        .filter(row => lineKeys.includes(row.LineKey))
                        .map(row => {
                            return {...row, selected: payload.selected};
                        }),
                    ...state.detail.filter(row => !lineKeys.includes(row.LineKey)),
                ].sort(defaultDetailSorter);
                return {...state, detail};
            }
            return state;
        case saveLabelDistributionRequested:
            if (state && payload?.lineKey) {
                const lineKey = payload.lineKey;
                const detail = [
                    ...state.detail.filter(row => row.LineKey === lineKey)
                        .map(row => {
                            if (row.labelData) {
                                row.labelData.saving = true;
                            }
                            return row;
                        }),
                    ...state.detail.filter(row => row.LineKey !== lineKey),
                ].sort(defaultDetailSorter);
                return {...state, detail};
            }
            return state;
        case saveLabelDistributionSucceeded:
            if (state && payload?.lineKey && payload.labels) {
                const lineKey = payload.lineKey;
                const [labelData] = payload.labels;
                const detail = [
                    ...state.detail.filter(row => row.LineKey === lineKey)
                        .map(row => {
                            return {...row, labelData};
                        }),
                    ...state.detail.filter(row => row.LineKey !== lineKey),
                ].sort(defaultDetailSorter);
                return {...state, detail};
            }
            return state;
        default:
            return state;
    }
}

const poLoadingReducer = (state: boolean = false, action: POAction): boolean => {
    switch (action.type) {
        case fetchRequested:
            return true;
        case fetchSucceeded:
        case fetchFailed:
            return false
        default:
            return state;
    }
}

const poLabelsLoadingReducer = (state: boolean = false, action: POAction): boolean => {
    switch (action.type) {
        case fetchLabelDistributionRequested:
            return true;
        case fetchLabelDistributionSucceeded:
        case fetchLabelDistributionFailed:
            return false
        default:
            return state;
    }
}


const requiredDatesReducer = (state: string[] = [], action: POAction): string[] => {
    const {type, payload} = action
    switch (type) {
        case fetchSucceeded:
            if (payload?.purchaseOrder) {
                const dates: string[] = [];
                payload.purchaseOrder.detail
                    .forEach(row => {
                        if (!dates.includes(row.RequiredDate)) {
                            dates.push(row.RequiredDate);
                        }
                    });
                return dates.sort();
            }
            return [];
        default:
            return state;
    }
}

const selectedDateReducer = (state: string = '', action: POAction): string => {
    const {type, payload} = action
    switch (type) {
        case fetchSucceeded:
            if (payload?.purchaseOrder) {
                const dates: string[] = [];
                payload.purchaseOrder.detail.forEach(row => {
                    if (!dates.includes(row.RequiredDate)) {
                        dates.push(row.RequiredDate);
                    }
                });
                if (dates.filter(d => d === state).length > 0) {
                    return state;
                }
                if (dates.length === 1) {
                    return dates[0];
                }
            }
            return '';
        default:
            return state;
    }
}

const receiptDateReducer = (state: string = new Date().toISOString(), action: POAction): string => {
    const {type, payload} = action;
    switch (type) {
        case setReceiptDate:
            return payload?.value || new Date().toISOString();
        default:
            return state;
    }
}

const labelCountReducer = (state: number = 0, action: POAction): number => {
    const {type, payload} = action;
    switch (type) {
        case fetchLabelCountSucceeded:
        case clearLabelsSucceeded:
            return payload?.quantity || 0;
        default:
            return state;
    }
}

// export default combineReducers({
//     purchaseOrderNo: purchaseOrderNoReducer,
//     purchaseOrder: purchaseOrderReducer,
//     poLoading: poLoadingReducer,
//     requiredDates: requiredDatesReducer,
//     selectedDate: selectedDateReducer,
//     poLabelsLoading: poLabelsLoadingReducer,
//     receiptDate: receiptDateReducer,
//     labelCount: labelCountReducer,
// });
