import * as React from 'react';

import Node from '~/components/pages/Node';

const App: React.SFC<any> = props => (
  <div data-test={'app'}>
    <Node />
  </div>
);

export default App;
