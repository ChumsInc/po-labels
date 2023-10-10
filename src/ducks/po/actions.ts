import {
    GetStateFn,
    LoadPOResponse,
    POLabelRecord,
    POOverstockRecord,
    PurchaseOrder, PurchaseOrderDetail,
    ToggleCheckedLine,
    LabelDistribution, PODistributionResponse, LabelDistributionResponse
} from "./types";
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

} from "./actionTypes";
import {
    selectPODetail,
    selectPOLabelsLoading,
    selectPOLoading,
    selectPurchaseOrder,
    selectPurchaseOrderNo,
    selectReceiptDate
} from "./selectors";
import {fetchJSON, fetchPOST, SortProps} from "chums-components";
import {createAction, createAsyncThunk} from "@reduxjs/toolkit";
import {AppDispatch, RootState} from "../../app/configureStore";
import {fetchPurchaseOrder, postLabelDistribution, PostLabelDistributionArg} from "./api";

export const setPurchaseOrderNo = createAction<string>('po/setPurchaseOrderNo');
export const setPORequiredDate = createAction<string>('po/setPORequiredDate');
export const setReceiptDate = createAction<string>('po/setReceiptDate');

export const setDetailSort = createAction<SortProps<PurchaseOrderDetail>>('po/setDetailSort');

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



export const saveLabelDistribution = createAsyncThunk<PODistributionResponse|null, PurchaseOrderDetail>(
    'po/saveLabelDistribution',
    async (arg, {getState}) => {
        const state = getState() as RootState;
        const receiptDate = selectReceiptDate(state);
        return await postLabelDistribution({line: arg, receiptDate});
    },
    {
        condition: (arg, {getState}) => {
            const state = getState() as RootState;
            return !!selectReceiptDate(state) && arg.ItemType === '1';
        }
    }
)



export const toggleCheckedLine = createAction<ToggleCheckedLine>('po/toggleCheckedLine');

export const selectForPrintingAction = (lineKey: string, selected: boolean) => ({
    type: selectForPrinting,
    payload: {lineKey, selected}
})
export const selectAllForPrintingAction = (lineKeys: string[], selected: boolean) => ({
    type: selectForPrinting,
    payload: {lineKeys, selected}
})





export const saveLabelDistributionAction = (lineKey: string) =>
    async (dispatch:AppDispatch, getState:GetStateFn) => {
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



export const setLabelsAction = (lineKey: string, quantities: number[]) => ({
    type: setLabelQuantities,
    payload: {lineKey, labelQuantities: quantities}
})


export const genLabelsAction = () =>
    async (dispatch:AppDispatch, getState:GetStateFn) => {
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
            // dispatch(addAlertAction({
            //     context: genLabelsRequested,
            //     color: 'success',
            //     message: `${generated} label${generated === 1 ? '' : 's'} created`,
            //     canDismiss: true
            // }));
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log("genLabelsAction()", error.message);
                return dispatch({type: genLabelsFailed, payload: {error, context: genLabelsRequested}})
            }
            console.error("genLabelsAction()", error);
        }
    }
export const clearPOLabelsAction = () =>
    async (dispatch:AppDispatch, getState:GetStateFn) => {
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
            // dispatch(addAlertAction({
            //     context: clearLabelsRequested,
            //     color: 'success',
            //     message: `All labels for PO ${po.PurchaseOrderNo} have been cleared`,
            //     canDismiss: true
            // }));
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log("clearPOLabelsAction()", error.message);
                return dispatch({type: clearLabelsFailed, payload: {error, context: clearLabelsRequested}})
            }
            console.error("clearPOLabelsAction()", error);
        }

    }

export const fetchLabelCountAction = () =>
    async (dispatch:AppDispatch, getState:GetStateFn) => {
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
