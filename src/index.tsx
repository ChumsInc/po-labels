import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {applyMiddleware, compose, createStore} from 'redux';
import {HashRouter} from 'react-router-dom';
import thunk from 'redux-thunk';
import reducer from './ducks';
import App from './components/App';

declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
    }
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(reducer, composeEnhancers(applyMiddleware(thunk)));

// const baseName = '/apps/direct-labor';
const baseName = '';

render(
    <Provider store={store}>
        <HashRouter>
            <App/>
        </HashRouter>
    </Provider>, document.getElementById('app')
);
