import {ActionInterface, ActionPayload, SortableTableField, SorterProps} from "chums-ducks";
import {ThunkAction} from "redux-thunk";
import {RootState} from "../index";
import {ReactElement} from "react";


export interface POPayload extends ActionPayload {
    purchaseOrder?: PurchaseOrder,
    lines?: PurchaseOrderDetail[]
    labels?: POLabelRecord[],
    overstock?: POOverstockRecord[],
    value?: string,
    quantity?: number,
    lineKey?: string,
    lineKeys?: string[],
    labelQuantities?: number[],
    selected?: boolean,
}

export interface POAction extends ActionInterface {
    payload?: POPayload,
}

export interface POThunkAction extends ThunkAction<any, RootState, unknown, POAction> {}

export interface POOverstockRecord {
    PurchaseOrderNo: string,
    LineKey: string,
    OverstockWarehouseCode: string,
    ItemCode: string,
    QuantityOnHand: number,
}

export interface PurchaseOrder {
    PurchaseOrderNo: string,
    APDivisionNo: string,
    VendorNo: string,
    PurchaseName: string,
    Comment: string,
    detail: PurchaseOrderDetail[],
}

export interface PurchaseOrderDetail {
    PurchaseOrderNo: string,
    LineKey: string,
    ItemType: string,
    ItemCode: string,
    ItemCodeDesc: string,
    RequiredDate: string,
    UnitOfMeasure: string,
    WarehouseCode: string,
    QuantityOrdered: number,
    QuantityReceived: number,
    UnitOfMeasureConvFactor: number,
    CommentText: string,
    WorkOrderNo: string|null,
    ItemBillNumber: string|null,
    labelData?: POLabelRecord|null,
    overstock?: POOverstockRecord|null,
    selected?: boolean,
}

export interface POLabelRecord {
    company: string,
    PurchaseOrderNo: string,
    LineKey: string,
    labelQuantities: number[],
    ReceiptDate: string,
    changed?: boolean
    saving?: boolean,
}

export interface POSorterProps extends SorterProps {
    field: keyof PurchaseOrderDetail,
}

export interface PODetailField extends SortableTableField {
    field: keyof PurchaseOrderDetail,
    render?: (row:PurchaseOrderDetail) => ReactElement | Element | string | number,
}

export interface LoadPOResponse {
    purchaseOrder: PurchaseOrder|null;
    distribution?: POLabelRecord[];
    labels?: number;
    overstock?: POOverstockRecord[];
}

export interface PODistributionResponse {
    distribution?: POLabelRecord[];
    labels?: number;
}

export interface LoadPODistributionResponse {
    result: POLabelRecord[];
    labels: number;
}
