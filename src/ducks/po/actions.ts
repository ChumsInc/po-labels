import {POAction, POLabelRecord, POThunkAction, PurchaseOrder} from "./types";
import {
    fetchFailed,
    fetchLabelDistributionFailed, fetchLabelDistributionRequested, fetchLabelDistributionSucceeded,
    fetchRequested,
    fetchSucceeded, setLabelQuantities,
    setPurchaseOrderNo, setSelectedDate
} from "./actionTypes";
import {selectPOLabelsLoading, selectPOLoading, selectPurchaseOrder, selectPurchaseOrderNo} from "./selectors";
import {fetchJSON} from "chums-ducks";

export const setPurchaseOrderNoAction = (value:string):POAction => ({type: setPurchaseOrderNo, payload: {value}});
export const setPORequiredDateAction = (value:string):POAction => ({type: setSelectedDate, payload: {value}});

export const fetchPurchaseOrderAction = ():POThunkAction =>
    async (dispatch, getState) => {
        try {
            const state = getState();
            const po = selectPurchaseOrderNo(state);
            const loading = selectPOLoading(state);
            if (loading || !po) {
                return;
            }
            dispatch({type: fetchRequested});
            const url = '/node-sage/api/CHI/po/:purchaseOrderNo'
                .replace(':purchaseOrderNo', encodeURIComponent(po));
            const {purchaseOrder} = await fetchJSON<{purchaseOrder:PurchaseOrder}>(url);
            dispatch({type: fetchSucceeded, payload: {purchaseOrder}});
            dispatch(fetchLabelDistributionAction());
        } catch(error:unknown) {
            if (error instanceof Error) {
                console.log("fetchPurchaseOrderAction()", error.message);
                return dispatch({type:fetchFailed, payload: {error, context: fetchRequested}});
            }
            console.error("fetchPurchaseOrderAction()", error);
        }
}

export const fetchLabelDistributionAction = ():POThunkAction =>
    async (dispatch, getState) => {
        try {
            const state = getState();
            const po = selectPurchaseOrder(state);
            const loading = selectPOLoading(state);
            const labelsLoading = selectPOLabelsLoading(state);
            if (!po || loading || labelsLoading) {
                return;
            }
            dispatch({type: fetchLabelDistributionRequested});
            const url = `/api/operations/production/po/labels/CHI/:PurchaseOrderNo`
                .replace(':PurchaseOrderNo', encodeURIComponent(po.PurchaseOrderNo));
            const {result} = await fetchJSON<{result: POLabelRecord[]}>(url);
            dispatch({type: fetchLabelDistributionSucceeded, payload: {labels: result}});
        } catch(error:unknown) {
            if (error instanceof Error) {
                console.log("fetchLabelDistributionAction()", error.message);
                return dispatch({type:fetchLabelDistributionFailed, payload: {error, context: fetchLabelDistributionRequested}})
            }
            console.error("fetchLabelDistributionAction()", error);
        }
    }

export const setLabelsAction = (lineKey: string, quantities:number[]):POAction => ({type: setLabelQuantities, payload: {lineKey, labelQuantities: quantities}})


//@TODO: send labels to barcodes db (genlabels)

