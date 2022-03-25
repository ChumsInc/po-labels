import {combineReducers} from "redux";
import {POAction, PurchaseOrder} from "./types";
import {
    fetchFailed, fetchLabelDistributionFailed,
    fetchLabelDistributionRequested, fetchLabelDistributionSucceeded,
    fetchRequested,
    fetchSucceeded, setLabelQuantities,
    setPurchaseOrderNo,
    setSelectedDate
} from "./actionTypes";
import {defaultDetailSorter, detailSorter} from "./utils";

const purchaseOrderNoReducer = (state:string = '', action: POAction): string => {
    const {type, payload} = action;
    switch (type) {
    case setPurchaseOrderNo:
        return payload?.value || '';
    default: return state;
    }
}

const purchaseOrderReducer = (state:PurchaseOrder|null = null, action:POAction):PurchaseOrder|null => {
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
                            labelQuantities: []
                        }
                    }
                    row.labelData.labelQuantities = payload.labelQuantities || [];
                    return row;
                }),
                ...state.detail.filter(row => row.LineKey !== payload.lineKey),
            ].sort(defaultDetailSorter);
            return {...state, detail};
        }
        return state;
    default: return state;
    }
}

const poLoadingReducer = (state:boolean = false, action:POAction):boolean => {
    switch (action.type) {
    case fetchRequested:
        return true;
    case fetchSucceeded:
    case fetchFailed:
        return false
    default: return state;
    }
}

const poLabelsLoadingReducer = (state:boolean = false, action:POAction):boolean => {
    switch (action.type) {
    case fetchLabelDistributionRequested:
        return true;
    case fetchLabelDistributionSucceeded:
    case fetchLabelDistributionFailed:
        return false
    default: return state;
    }
}



const requiredDatesReducer = (state:string[] = [], action:POAction):string[] => {
    const {type, payload} = action
    switch (type) {
    case fetchSucceeded:
        if (payload?.purchaseOrder) {
            const dates:string[] = [];
            payload.purchaseOrder.detail.forEach(row => {
                if (!dates.includes(row.RequiredDate)) {
                    dates.push(row.RequiredDate);
                }
            });
            return dates.sort();
        }
        return [];
    default: return state;
    }
}

const selectedDateReducer = (state: string = '', action:POAction):string => {
    const {type, payload} = action
    switch (type) {
    case fetchSucceeded:
        return '';
    case setSelectedDate:
        return payload?.value || '';
    default: return state;
    }
}

export default combineReducers({
    purchaseOrderNo: purchaseOrderNoReducer,
    purchaseOrder: purchaseOrderReducer,
    poLoading: poLoadingReducer,
    requiredDates: requiredDatesReducer,
    selectedDate: selectedDateReducer,
    poLabelsLoading: poLabelsLoadingReducer,
});
