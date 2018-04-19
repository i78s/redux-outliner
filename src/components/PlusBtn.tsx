import * as React from 'react';

export interface PlusBtnProps {
  onClick: () => void;
}

const PlusBtn: React.SFC<PlusBtnProps> = ({ onClick }) => (
  <button onClick={onClick}>+</button>
);

export default PlusBtn;
