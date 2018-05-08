import * as React from 'react';
import { compose, withHandlers } from 'recompose';

interface ItemProps {
  title: string;
  onPaste: () => void;
}

const Item: React.SFC<ItemProps> = ({ title, onPaste }) => {
  return (
    <div
      suppressContentEditableWarning={true}
      contentEditable={true}
      onPaste={onPaste}
    >
      {title}
      </div>
  );
};

const enhance = compose<any, any>(
  withHandlers({
    onPaste: props => (e: ClipboardEvent) => {
      e.preventDefault();
      const value: string = e.clipboardData.getData('text/plain');
      document.execCommand('insertHTML', false, value);
    },
  }),
)(Item);

export default enhance;
