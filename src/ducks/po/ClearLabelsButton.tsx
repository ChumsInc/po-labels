import React, {useEffect} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {selectLabelCount, selectPOLabelsLoading, selectPOLoading} from "./selectors";
import {clearPOLabelsAction, fetchLabelCountAction} from "./actions";


const ClearLabelsButton:React.FC = () => {
    const dispatch = useDispatch();
    const loading = useSelector(selectPOLoading);
    const labelsLoading = useSelector(selectPOLabelsLoading);
    const labelCount = useSelector(selectLabelCount);

    useEffect(() => {
        dispatch(fetchLabelCountAction());
    })
    const clickHandler = () => {
        dispatch(clearPOLabelsAction());
    }

    return (
        <button type="button" className="btn btn-sm btn-danger" onClick={clickHandler} disabled={loading || labelsLoading || !labelCount}>
            Clear Existing Labels ({labelCount})
        </button>
    );
}

export default ClearLabelsButton;
