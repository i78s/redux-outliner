import * as React from 'react';

import Editor from 'components/Editor';

const App: React.SFC<any> = (props) => (
  <div>
    <h1 data-test={'app-logo'}>App</h1>
    <Editor />
  </div>
);

export default App;
