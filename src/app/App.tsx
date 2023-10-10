import React from "react";
import POToolbar from "../ducks/po/POToolbar";
import PODetailTable from "../ducks/po/PODetailTable";
import AlertList from "../ducks/alerts/AlertList";

const App:React.FC = () => {
    return (
        <div className="container-fluid">
            <AlertList />
            <POToolbar />
            <PODetailTable />
        </div>
    )
}

export default App;
