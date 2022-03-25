import React from 'react';
import POInputField from "./POInputField";
import PODateSelect from "./PODateSelect";
import POInfoHeader from "./POInfoHeader";

const POToolbar:React.FC = () => {

    return (
        <div>
        <div className="row g-3 align-items-baseline">
            <div className="col-auto">
                <POInputField />
            </div>
            <div className="col-auto">
                <PODateSelect />
            </div>
        </div>
            <POInfoHeader />
        </div>
    );
}

export default POToolbar;
