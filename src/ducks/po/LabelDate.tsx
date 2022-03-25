import React from 'react';

export interface LabelDateProps {
    date?: string,
}
const LabelDate:React.FC<LabelDateProps> = ({date}) => {
    if (!date) {
        return (<span>&mdash;</span>);
    }
    return (
        <span>{new Date(date).toLocaleDateString(undefined, {dateStyle: 'short'})}</span>
    );
}
export default LabelDate
