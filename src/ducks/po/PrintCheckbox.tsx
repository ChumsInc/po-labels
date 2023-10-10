import React, {ChangeEvent, useId} from "react";

export interface PrintCheckboxProps {
    checked: boolean,
    disabled?: boolean,
    onChange: (ev:ChangeEvent<HTMLInputElement>) => void,
    cbRef?: React.Ref<HTMLInputElement>,
    children?: React.ReactNode
}

const PrintCheckbox:React.FC<PrintCheckboxProps> = ({
                                                         checked,
                                                         disabled,
                                                         onChange,
                                                         cbRef,
                                                         children
                                                     }) => {
    const id = useId();
    return (
        <div className="form-check form-check-inline">
            <label htmlFor={id}>
                <span className={checked ? 'bi-printer-fill' : 'bi-printer'}/>
                {children}
            </label>
            <input type="checkbox" className={"form-check-input"} id={id}
                   checked={checked} onChange={onChange}
                   disabled={disabled} ref={cbRef}/>
        </div>
    )

};

export default PrintCheckbox;
