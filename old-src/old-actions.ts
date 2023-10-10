import {
    LoadPOResponse,
    POAction,
    POLabelRecord,
    POOverstockRecord,
    POThunkAction,
    PurchaseOrder,
    ToggleCheckedLine
} from "../src/ducks/po/types";
import {
    clearLabelsFailed,
    clearLabelsRequested,
    clearLabelsSucceeded,
    fetchFailed, fetchLabelCountFailed, fetchLabelCountRequested, fetchLabelCountSucceeded,
    fetchLabelDistributionFailed,
    fetchLabelDistributionRequested,
    fetchLabelDistributionSucceeded,
    fetchOverstockFailed,
    fetchOverstockRequested,
    fetchOverstockSucceeded,
    fetchRequested,
    fetchSucceeded,
    genLabelsFailed,
    genLabelsRequested,
    genLabelsSucceeded,
    saveLabelDistributionFailed,
    saveLabelDistributionRequested,
    saveLabelDistributionSucceeded,
    selectForPrinting,
    setLabelQuantities,
} from "../src/ducks/po/actionTypes";
import {
    selectPODetail,
    selectPOLabelsLoading,
    selectPOLoading,
    selectPurchaseOrder,
    selectPurchaseOrderNo,
    selectReceiptDate
} from "../src/ducks/po/selectors";
import {addAlertAction, dismissContextAlert, fetchJSON, fetchPOST} from "chums-ducks";
import {createAction, createAsyncThunk} from "@reduxjs/toolkit";
import {RootState} from "../src/app/configureStore";
import {fetchPurchaseOrder} from "../src/ducks/po/api";

export const setPurchaseOrderNo = createAction<string>('po/setPurchaseOrderNo');
export const setPORequiredDate = createAction<string>('po/setPORequiredDate');
export const setReceiptDate = createAction<string>('po/setReceiptDate');

export const loadPurchaseOrder = createAsyncThunk<LoadPOResponse|null, string>(
    'po/loadPurchaseOrder',
    async (arg) => {
        return await fetchPurchaseOrder(arg);
    },
    {
        condition: (arg, {getState}) => {
            const state = getState() as RootState;
            return !selectPOLoading(state);
        }
    }
)

export const toggleCheckedLine = createAction<ToggleCheckedLine>('po/toggleCheckedLine');

export const selectForPrintingAction = (lineKey: string, selected: boolean): POAction => ({
    type: selectForPrinting,
    payload: {lineKey, selected}
})
export const selectAllForPrintingAction = (lineKeys: string[], selected: boolean): POAction => ({
    type: selectForPrinting,
    payload: {lineKeys, selected}
})


export const _loadPurchaseOrder = (): POThunkAction =>
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
            const {purchaseOrder} = await fetchJSON<{ purchaseOrder: PurchaseOrder }>(url);
            dispatch({type: fetchSucceeded, payload: {purchaseOrder}});
            dispatch(dismissContextAlert(fetchRequested));
            await dispatch(fetchLabelDistributionAction());
            await dispatch(fetchPOOverstockAction());
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log("fetchPurchaseOrderAction()", error.message);
                return dispatch({type: fetchFailed, payload: {error, context: fetchRequested}});
            }
            console.error("fetchPurchaseOrderAction()", error);
        }
    }

export const fetchLabelDistributionAction = (): POThunkAction =>
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
            const {result: labels, labels: quantity} = await fetchJSON<{ result: POLabelRecord[], labels: number }>(url);
            dispatch({type: fetchLabelDistributionSucceeded, payload: {labels, quantity}});
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log("fetchLabelDistributionAction()", error.message);
                return dispatch({
                    type: fetchLabelDistributionFailed,
                    payload: {error, context: fetchLabelDistributionRequested}
                })
            }
            console.error("fetchLabelDistributionAction()", error);
        }
    }

export const saveLabelDistributionAction = (lineKey: string): POThunkAction =>
    async (dispatch, getState) => {
        try {
            const state = getState();
            const po = selectPurchaseOrder(state);
            const detail = selectPODetail(state);
            const receiptDate = selectReceiptDate(state);
            if (!lineKey || !po || !detail || !receiptDate) {
                return;
            }
            const [row] = detail.filter(row => row.LineKey === lineKey);
            if (!row || !row.labelData) {
                return;
            }

            dispatch({type: saveLabelDistributionRequested, payload: {lineKey}});
            const url = '/api/operations/production/po/labels/CHI/:PurchaseOrderNo/:LineKey'
                .replace(':PurchaseOrderNo', encodeURIComponent(po.PurchaseOrderNo))
                .replace(':LineKey', encodeURIComponent(lineKey));

            const data = {labels: row.labelData.labelQuantities.filter(q => q !== 0), date: receiptDate};
            const {result: labels, labels: quantity} = await fetchJSON<{ result: POLabelRecord[], labels: number }>(url, {
                method: 'post',
                body: JSON.stringify(data)
            });
            dispatch({type: saveLabelDistributionSucceeded, payload: {labels, lineKey, quantity}});
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log("saveLabelDistributionAction()", error.message);
                return dispatch({
                    type: saveLabelDistributionFailed,
                    payload: {error, context: saveLabelDistributionRequested}
                })
            }
            console.error("saveLabelDistributionAction()", error);
        }
    }


export const fetchPOOverstockAction = (): POThunkAction =>
    async (dispatch, getState) => {
        try {
            const state = getState();
            const po = selectPurchaseOrder(state);
            const loading = selectPOLoading(state);
            const labelsLoading = selectPOLabelsLoading(state);
            if (!po || loading || labelsLoading) {
                return;
            }
            dispatch({type: fetchOverstockRequested});
            const url = `/api/operations/production/po/overstock/CHI/:PurchaseOrderNo`
                .replace(':PurchaseOrderNo', encodeURIComponent(po.PurchaseOrderNo));
            const {overstock} = await fetchJSON<{ overstock: POOverstockRecord[] }>(url);
            dispatch({type: fetchOverstockSucceeded, payload: {overstock}});
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log("fetchPOOverstockAction()", error.message);
                return dispatch({type: fetchOverstockFailed, payload: {error, context: fetchOverstockRequested}})
            }
            console.error("fetchPOOverstockAction()", error);
        }
    }

export const setLabelsAction = (lineKey: string, quantities: number[]): POAction => ({
    type: setLabelQuantities,
    payload: {lineKey, labelQuantities: quantities}
})


export const genLabelsAction = (): POThunkAction =>
    async (dispatch, getState) => {
        try {
            const state = getState();
            const po = selectPurchaseOrder(state);
            const loading = selectPOLoading(state);
            const labelsLoading = selectPOLabelsLoading(state);
            const detail = selectPODetail(state);
            if (!po || loading || labelsLoading || !detail.length) {
                return;
            }
            dispatch({type: genLabelsRequested});
            const rows = detail.filter(row => row.selected && !!row.labelData);
            let generated = 0;
            for await (const row of rows) {
                if (row.labelData?.labelQuantities.length) {
                    const url = '/api/operations/production/po/labels/CHI/:purchaseOrderNo/:lineKey/gen'
                        .replace(':purchaseOrderNo', encodeURIComponent(row.PurchaseOrderNo))
                        .replace(':lineKey', encodeURIComponent(row.LineKey));
                    const data = row.labelData.labelQuantities.filter(val => !!val && val > 0);
                    await fetchPOST(url, data);
                    generated += data.length;
                }
            }
            dispatch({type: genLabelsSucceeded});
            dispatch(fetchLabelCountAction());
            dispatch(addAlertAction({
                context: genLabelsRequested,
                color: 'success',
                message: `${generated} label${generated === 1 ? '' : 's'} created`,
                canDismiss: true
            }));
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log("genLabelsAction()", error.message);
                return dispatch({type: genLabelsFailed, payload: {error, context: genLabelsRequested}})
            }
            console.error("genLabelsAction()", error);
        }
    }
export const clearPOLabelsAction = (): POThunkAction =>
    async (dispatch, getState) => {
        try {
            const state = getState();
            const loading = selectPOLoading(state);
            const po = selectPurchaseOrder(state);
            const labelsLoading = selectPOLabelsLoading(state);
            if (!po || loading || labelsLoading) {
                return;
            }
            dispatch({type: clearLabelsRequested});
            const url = '/api/operations/production/po/labels/CHI/:purchaseOrderNo'
                .replace(':purchaseOrderNo', encodeURIComponent(po.PurchaseOrderNo));
            const {labels} = await fetchJSON(url, {method: 'DELETE'});
            dispatch({type: clearLabelsSucceeded, payload: {quantity: labels}});
            dispatch(addAlertAction({
                context: clearLabelsRequested,
                color: 'success',
                message: `All labels for PO ${po.PurchaseOrderNo} have been cleared`,
                canDismiss: true
            }));
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log("clearPOLabelsAction()", error.message);
                return dispatch({type: clearLabelsFailed, payload: {error, context: clearLabelsRequested}})
            }
            console.error("clearPOLabelsAction()", error);
        }

    }

export const fetchLabelCountAction = (): POThunkAction =>
    async (dispatch, getState) => {
        try {
            const state = getState();
            const loading = selectPOLoading(state);
            const po = selectPurchaseOrder(state);
            const labelsLoading = selectPOLabelsLoading(state);
            if (!po || loading || labelsLoading) {
                return;
            }
            dispatch({type: fetchLabelCountRequested});
            const url = '/api/operations/production/po/labels/CHI/:purchaseOrderNo/label-count'
                .replace(':purchaseOrderNo', encodeURIComponent(po.PurchaseOrderNo));
            const {labels} = await fetchJSON(url, {cache: 'no-cache'});
            dispatch({type: fetchLabelCountSucceeded, payload: {quantity: labels}});
        } catch(error:unknown) {
            if (error instanceof Error) {
                console.log("()", error.message);
                return dispatch({type: fetchLabelCountFailed, payload: {error, context: fetchLabelCountRequested}})
            }
            console.error("()", error);
        }
    }
