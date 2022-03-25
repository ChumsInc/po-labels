import {combineReducers} from 'redux'
import {alertsReducer, pagesReducer, sortableTablesReducer} from 'chums-ducks';
import {default as poReducer} from './po';

const rootReducer = combineReducers({
    alerts: alertsReducer,
    pages: pagesReducer,
    po: poReducer,
    sortableTables: sortableTablesReducer,
});

export type RootState = ReturnType<typeof rootReducer>
export default rootReducer;
