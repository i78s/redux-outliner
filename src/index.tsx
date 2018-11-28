import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import 'reset-css';

import App from '~/App';
import store from '~/modules/store';

if (process.env.NODE_ENV !== 'production') {
  // tslint:disable-next-line:no-var-requires
  const { whyDidYouUpdate } = require('why-did-you-update');
  whyDidYouUpdate(React);
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement,
);
