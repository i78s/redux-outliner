import * as React from 'react';

interface ResultProps {
  result: number;
}

const Result: React.SFC<ResultProps> = props => (
  <div>
    Result: <span>{props.result}</span>
  </div>
);

export default Result;
