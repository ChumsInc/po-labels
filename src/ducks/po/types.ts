import {SortableTableField, SortProps} from 'chums-components'
import {RootState} from "../../app/configureStore";

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

export type POSorterProps = SortProps<PODetailField>;

export type PODetailField = SortableTableField<PurchaseOrderDetail>;

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

export interface ToggleCheckedLine {
    lineKey: string;
    checked?: boolean;
}

export interface LabelDistribution {
    lineKey: string
}

export interface LabelDistributionResponse{
    result: LabelDistribution
}



export type GetStateFn = () => RootState;

export interface PODetailMap {
    [key: string]: PurchaseOrderDetail;
}