import React from 'react'
import {POLabelRecord} from "./types";
import classNames from "classnames";

export interface LabelTotalInfoProps {
    labelData?: POLabelRecord|null,
}
const LabelTotalInfo:React.FC<LabelTotalInfoProps> = ({labelData}) => {
    if (!labelData) {
        return null;
    }
    const {labelQuantities, changed, saving} = labelData;
    return (
        <div className="d-flex justify-content-between">
            <div className={classNames("fade", {show: changed || saving, 'text-danger': changed && !saving, 'text-success': saving})}>
                {changed && !saving && (<span className="bi-cloud-upload" />) }
                {saving && (<span className="bi-cloud-upload-fill" />)}
            </div>
            <div>
                {labelQuantities.filter(val => !!val).reduce((cv, pv) => cv + pv, 0)}
            </div>
        </div>
    )
}

export default LabelTotalInfo;
