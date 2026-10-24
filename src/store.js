// redux 5 still ships createStore (as legacy_createStore); @reduxjs/toolkit's configureStore is the modern route.
import { legacy_createStore as createStore } from 'redux';
import reducer from './ducks/reducer';

const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

export default store;
