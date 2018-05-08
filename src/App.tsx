import * as React from 'react';

import Editor from 'components/Editor';

import projects from 'services/projects';

projects.get(1)
  .then(res => {
    // tslint:disable-next-line:no-console
    console.log(res.nodes);
  });

const App: React.SFC<any> = (props) => (
  <div>
    App
    <Editor />
  </div>
);

export default App;
