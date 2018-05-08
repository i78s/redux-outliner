import * as React from 'react';

interface ItemProps {
  title: string;
}

const Item: React.SFC<ItemProps> = ({ title }) => {
  return (
    <div
      suppressContentEditableWarning={true}
      contentEditable={true}
    >
      {title}
      </div>
  );
};

export default Item;
