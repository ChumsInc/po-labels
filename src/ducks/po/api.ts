import {
    LoadPODistributionResponse,
    LoadPOResponse,
    PODistributionResponse,
    POOverstockRecord,
    PurchaseOrder,
    PurchaseOrderDetail
} from "./types";
import {fetchJSON} from "chums-components";
import {defaultDetailSorter} from "./utils";

export async function fetchPurchaseOrder(arg: string): Promise<LoadPOResponse | null> {
    try {
        const url = `/node-sage/api/CHI/po/${encodeURIComponent(arg)}`;
        const res = await fetchJSON<{ purchaseOrder?: PurchaseOrder }>(url, {cache: "no-cache"});
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
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.debug("fetchPurchaseOrder()", err.message);
            return Promise.reject(err);
        }
        console.debug("fetchPurchaseOrder()", err);
        return Promise.reject(new Error('Error in fetchPurchaseOrder()'));
    }
}

export async function fetchLabelDistribution(arg: string): Promise<PODistributionResponse | null> {
    try {
        const url = `/api/operations/production/po/labels/CHI/${encodeURIComponent(arg)}`;
        const res = await fetchJSON<LoadPODistributionResponse>(url, {cache: 'no-cache'});
        return {
            distribution: res.result ?? [],
            labels: res.labels ?? 0
        };
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.debug("fetchLabelDistribution()", err.message);
            return Promise.reject(err);
        }
        console.debug("fetchLabelDistribution()", err);
        return Promise.reject(new Error('Error in fetchLabelDistribution()'));
    }
}

export async function fetchPOOverstock(arg: string): Promise<POOverstockRecord[]> {
    try {
        const url = `/api/operations/production/po/overstock/CHI/${encodeURIComponent(arg)}`;
        const res = await fetchJSON<{ overstock: POOverstockRecord[] }>(url);
        return res.overstock ?? [];
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.debug("fetchPOOverstock()", err.message);
            return Promise.reject(err);
        }
        console.debug("fetchPOOverstock()", err);
        return Promise.reject(new Error('Error in fetchPOOverstock()'));
    }
}

export interface PostLabelDistributionArg {
    line: PurchaseOrderDetail;
    receiptDate: string;
}

export async function postLabelDistribution(arg: PostLabelDistributionArg): Promise<PODistributionResponse | null> {
    try {
        const url = '/api/operations/production/po/labels/CHI/:PurchaseOrderNo/:LineKey'
            .replace(':PurchaseOrderNo', encodeURIComponent(arg.line.PurchaseOrderNo))
            .replace(':LineKey', encodeURIComponent(arg.line.LineKey));

        const body = JSON.stringify({
            labels: arg.line.labelData!.labelQuantities.filter(q => q !== 0),
            date: arg.receiptDate
        });
        const res = await fetchJSON<LoadPODistributionResponse>(url, {method: 'post', body});
        return {
            distribution: res.result ?? [],
            labels: res.labels ?? 0
        };
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.debug("postLabelDistribution()", err.message);
            return Promise.reject(err);
        }
        console.debug("postLabelDistribution()", err);
        return Promise.reject(new Error('Error in postLabelDistribution()'));
    }
}

export async function postGenerateLabels(arg: PurchaseOrderDetail[]): Promise<number> {
    try {
        const rows = arg.filter(row => row.selected && !!row.labelData);
        let generated = 0;
        for await (const row of rows) {
            if (row.labelData?.labelQuantities.length) {
                const url = '/api/operations/production/po/labels/CHI/:purchaseOrderNo/:lineKey/gen'
                    .replace(':purchaseOrderNo', encodeURIComponent(row.PurchaseOrderNo))
                    .replace(':lineKey', encodeURIComponent(row.LineKey));
                const data = row.labelData.labelQuantities.filter(val => !!val && val > 0);
                await fetchJSON(url, {method: 'POST', body: JSON.stringify(data)});
                generated += data.length;
            }
        }
        return generated;
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.debug("postGenerateLabels()", err.message);
            return Promise.reject(err);
        }
        console.debug("postGenerateLabels()", err);
        return Promise.reject(new Error('Error in postGenerateLabels()'));
    }
}

export async function deletePOLabels(arg: string): Promise<number> {
    try {
        const url = `/api/operations/production/po/labels/CHI/${encodeURIComponent(arg)}`;
        const res = await fetchJSON<{ labels: number }>(url, {method: 'DELETE'});
        return res.labels ?? 0;
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.debug("deletePOLabels()", err.message);
            return Promise.reject(err);
        }
        console.debug("deletePOLabels()", err);
        return Promise.reject(new Error('Error in deletePOLabels()'));
    }
}
