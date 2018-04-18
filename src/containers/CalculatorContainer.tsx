import * as React from 'react';

import NumBtn from 'components/NumBtn';

export default class CalculatorContainer extends React.Component {

  public render() {
    return (
      <div>
        <div>
          <NumBtn n={1} />
          <NumBtn n={2} />
          <NumBtn n={3} />
        </div>
        <div>
          <NumBtn n={4} />
          <NumBtn n={5} />
          <NumBtn n={6} />
        </div>
        <div>
          <NumBtn n={7} />
          <NumBtn n={8} />
          <NumBtn n={9} />
        </div>
        <div>
          <NumBtn n={0} />
          <button>+</button>
        </div>
        <div>
          Result: <span>some value44</span>
        </div>
      </div>
    );
  }
}
