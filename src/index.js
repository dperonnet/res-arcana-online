import React from 'react';
import ReactDOM from 'react-dom';
import ResArcanaApp from './client/ResArcanaApp';
import registerServiceWorker from './registerServiceWorker';
import { Provider } from 'react-redux'
import { store } from './store/store';
import { verifyAuth } from './store/actions/authActions';

store.dispatch(verifyAuth());

store.firebaseAuthIsReady.then(()=>{
  ReactDOM.render(
    <Provider store={store}><ResArcanaApp /></Provider>,
    document.getElementById('root'));
  registerServiceWorker();
})

