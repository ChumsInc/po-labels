import React from "react";

export interface PrintCheckboxProps {
    checked: boolean,
    disabled?: boolean,
    onChange: () => void,
    cbRef?: React.Ref<HTMLInputElement>,
}

const PrintCheckbox:React.FC<PrintCheckboxProps> = ({
                                                         checked,
                                                         disabled,
                                                         onChange,
                                                         cbRef,
                                                         children
                                                     }) => {
    return (
        <div className="form-check form-check-inline">
            <label onClick={onChange}>
                <span className={checked ? 'bi-printer-fill' : 'bi-printer'}/>
                {children}
            </label>
            <input type="checkbox" className={"form-check-input"} checked={checked} onChange={onChange}
                   disabled={disabled} ref={cbRef}/>
        </div>
    )

};

export default PrintCheckbox;
