import * as React from 'react';

import Editor from './components/Editor';

const App: React.SFC<any> = props => (
  <div data-test={'app'}>
    <Editor />
  </div>
);

export default App;
