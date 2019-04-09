import React from 'react';
import ReactDOM from 'react-dom';
import ResArcanaApp from './client/ResArcanaApp';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <ResArcanaApp />,
  document.getElementById('root'));
registerServiceWorker();
