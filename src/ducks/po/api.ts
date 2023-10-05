import {LoadPOResponse, POLabelRecord, POOverstockRecord, PurchaseOrder} from "./types";
import {fetchJSON} from "chums-components";
import {over} from "lodash";
import {defaultDetailSorter} from "./utils";

export async function fetchPurchaseOrder(arg:string):Promise<LoadPOResponse|null> {
    try {
        const url = '/node-sage/api/CHI/po/:purchaseOrderNo'
            .replace(':purchaseOrderNo', encodeURIComponent(arg));
        const res = await fetchJSON<{purchaseOrder?: PurchaseOrder}>(url, {cache: "no-cache"});
        if (!res.purchaseOrder) {
            return null;
        }
        const dist = await fetchLabelDistribution(arg);
        const overstock = await fetchPOOverstock(arg);
        const detail = res.purchaseOrder.detail.map(row => {
            const [os] = overstock.filter(os => os.LineKey === row.LineKey);
            const [labelData] = (dist?.distribution ?? []).filter(d => d.LineKey === row.LineKey);
            return {
                ...row,
                overstock: os ?? null,
                labelData: labelData ?? null,
            }
        }).sort(defaultDetailSorter);
        return {
            purchaseOrder: {...res.purchaseOrder, detail},
            distribution: dist?.distribution ?? [],
            labels: dist?.labels ?? 0,
        }
    } catch(err:unknown) {
        if (err instanceof Error) {
            console.debug("fetchPurchaseOrder()", err.message);
            return Promise.reject(err);
        }
        console.debug("fetchPurchaseOrder()", err);
        return Promise.reject(new Error('Error in fetchPurchaseOrder()'));
    }
}

export async function fetchLabelDistribution(arg:string):Promise<LoadPOResponse|null> {
    try {
        const url = `/api/operations/production/po/labels/CHI/:PurchaseOrderNo`
            .replace(':PurchaseOrderNo', encodeURIComponent(arg));
        const res = await fetchJSON<{ result: POLabelRecord[], labels: number }>(url, {cache: 'no-cache'});
        const {result, labels} = res;
        return {purchaseOrder: null, distribution: result, labels};
    } catch(err:unknown) {
        if (err instanceof Error) {
            console.debug("fetchLabelDistribution()", err.message);
            return Promise.reject(err);
        }
        console.debug("fetchLabelDistribution()", err);
        return Promise.reject(new Error('Error in fetchLabelDistribution()'));
    }
}

export async function fetchPOOverstock(arg:string):Promise<POOverstockRecord[]> {
    try {
        const url = `/api/operations/production/po/overstock/CHI/:PurchaseOrderNo`
            .replace(':PurchaseOrderNo', encodeURIComponent(arg));
        const res = await fetchJSON<{ overstock: POOverstockRecord[] }>(url);
        return res.overstock ?? [];
    } catch(err:unknown) {
        if (err instanceof Error) {
            console.debug("fetchPOOverstock()", err.message);
            return Promise.reject(err);
        }
        console.debug("fetchPOOverstock()", err);
        return Promise.reject(new Error('Error in fetchPOOverstock()'));
    }
}
