import * as React from 'react';

export interface NumBtnProps {
  n: number;
}

const NumBtn: React.SFC<NumBtnProps> = ({ n }) => (
  <button>{n}</button>
);

export default NumBtn;
