import * as React from 'react';

interface ItemProps {
  title: string;
}

const Item: React.SFC<ItemProps> = ({ title }) => {
  return (
    <div>{title}</div>
  );
};

export default Item;
