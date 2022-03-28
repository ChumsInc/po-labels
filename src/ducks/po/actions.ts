import {POAction, POLabelRecord, POOverstockRecord, POThunkAction, PurchaseOrder} from "./types";
import {
    fetchFailed,
    fetchLabelDistributionFailed,
    fetchLabelDistributionRequested,
    fetchLabelDistributionSucceeded,
    fetchOverstockFailed,
    fetchOverstockRequested,
    fetchOverstockSucceeded,
    fetchRequested,
    fetchSucceeded, genLabelsFailed, genLabelsRequested, genLabelsSucceeded,
    saveLabelDistributionFailed,
    saveLabelDistributionRequested,
    saveLabelDistributionSucceeded,
    selectForPrinting,
    setLabelQuantities,
    setPurchaseOrderNo,
    setReceiptDate,
    setSelectedDate
} from "./actionTypes";
import {
    selectPODetail,
    selectPOLabelsLoading,
    selectPOLoading,
    selectPurchaseOrder,
    selectPurchaseOrderNo,
    selectReceiptDate
} from "./selectors";
import {dismissContextAlert, fetchJSON, fetchPOST} from "chums-ducks";

export const setPurchaseOrderNoAction = (value: string): POAction => ({type: setPurchaseOrderNo, payload: {value}});
export const setPORequiredDateAction = (value: string): POAction => ({type: setSelectedDate, payload: {value}});

export const setReceiptDateAction = (value?: string): POAction => ({type: setReceiptDate, payload: {value}});

export const selectForPrintingAction = (lineKey: string, selected: boolean): POAction => ({
    type: selectForPrinting,
    payload: {lineKey, selected}
})
export const selectAllForPrintingAction = (lineKeys: string[], selected: boolean): POAction => ({
    type: selectForPrinting,
    payload: {lineKeys, selected}
})

export const fetchPurchaseOrderAction = (): POThunkAction =>
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
            const {result} = await fetchJSON<{ result: POLabelRecord[] }>(url);
            dispatch({type: fetchLabelDistributionSucceeded, payload: {labels: result}});
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
            const {result} = await fetchJSON<{ result: POLabelRecord[] }>(url, {
                method: 'post',
                body: JSON.stringify(data)
            });
            dispatch({type: saveLabelDistributionSucceeded, payload: {labels: result, lineKey}});
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


export const genLabels = ():POThunkAction =>
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
            for await (const row of rows) {
                const url = '/api/operations/production/po/labels/CHI/:purchaseOrderNo/:lineKey/gen'
                    .replace(':purchaseOrderNo', encodeURIComponent(row.PurchaseOrderNo))
                    .replace(':lineKey', encodeURIComponent(row.LineKey));
                const data = (row.labelData?.labelQuantities || []).filter(val => !!val && val > 0);
                await fetchPOST(url, data);
            }
            dispatch({type: genLabelsSucceeded});
        } catch(error:unknown) {
            if (error instanceof Error) {
                console.log("genLabels()", error.message);
                return dispatch({type:genLabelsFailed, payload: {error, context: genLabelsRequested}})
            }
            console.error("genLabels()", error);
        }
    }
