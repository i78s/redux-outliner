import * as React from 'react';

import Editor from 'components/Editor';

import nodes from 'services/nodes';

nodes.get(1)
  .then(res => {
    // tslint:disable-next-line:no-console
    console.log(res.title);
  });

const App: React.SFC<any> = (props) => (
  <div>
    App
    <Editor />
  </div>
);

export default App;
