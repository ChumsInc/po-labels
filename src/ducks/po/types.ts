import {ActionInterface, ActionPayload, SortableTableField, SorterProps} from "chums-ducks";
import {ThunkAction} from "redux-thunk";
import {RootState} from "../index";


export interface POPayload extends ActionPayload {
    purchaseOrder?: PurchaseOrder,
    lines?: PurchaseOrderDetail[]
    labels?: POLabelRecord[],
    value?: string,
    lineKey?: string,
    labelQuantities?: number[],
}

export interface POAction extends ActionInterface {
    payload?: POPayload,
}

export interface POThunkAction extends ThunkAction<any, RootState, unknown, POAction> {}

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
    labelData?: POLabelRecord,
    selected?: boolean,
}

export interface POLabelRecord {
    company: string,
    PurchaseOrderNo: string,
    LineKey: string,
    labelQuantities: number[],
    ReceiptDate: string,
}

export interface POSorterProps extends SorterProps {
    field: keyof PurchaseOrderDetail,
}

export interface PODetailField extends SortableTableField {
    field: keyof PurchaseOrderDetail,
}
