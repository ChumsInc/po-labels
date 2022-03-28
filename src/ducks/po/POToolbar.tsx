import React from 'react';
import POInputForm from "./POInputForm";
import PODateSelect from "./PODateSelect";
import POInfoHeader from "./POInfoHeader";

const POToolbar:React.FC = () => {

    return (
        <div>
            <POInputForm />
            <POInfoHeader />
        </div>
    );
}

export default POToolbar;
