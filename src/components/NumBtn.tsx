import * as React from 'react';

export interface NumBtnProps {
  n: number;
  onClick: () => void;
}

const NumBtn: React.SFC<NumBtnProps> = ({ n, onClick }) => (
  <button onClick={onClick}>{n}</button>
);

export default NumBtn;
