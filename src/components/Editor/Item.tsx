import * as React from 'react';
import { compose, withHandlers } from 'recompose';
import { NodeEntity } from 'services/models';

interface ItemProps {
  node: NodeEntity;
  onInput: () => void;
  onKeyDown: () => void;
  onPaste: () => void;
}

/**
 * 追加
 *  Enterキーを押下した時
 *  同じ親を持つノードを追加
 *  並び順は追加元の次の番号
 * 削除
 *  ノードが空になる かつ ノードが子要素を持っていない
 */

const Item: React.SFC<ItemProps> = ({
  node,
  onInput,
  onPaste,
  onKeyDown,
}) => {
  return (
    <span
      suppressContentEditableWarning={true}
      contentEditable={true}
      onInput={onInput}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
    >
      {node.title}
    </span>
  );
};

const enhance = compose<any, any>(
  withHandlers({
    onInput: props => (e: InputEvent<HTMLSpanElement>) => {
      // const value = e.target.value;

      // tslint:disable-next-line:no-console
      console.dir(e.target.innerText);
    },
    onKeyDown: props => (e: KeyboardEvent) => {
      if (e.keyCode === 13) {
        e.preventDefault();
        // todo 兄弟ノードを新規作成
      }
    },
    onPaste: props => (e: ClipboardEvent) => {
      e.preventDefault();
      const value: string = e.clipboardData.getData('text/plain');
      document.execCommand('insertHTML', false, value);
    },
  }),
)(Item);

export default enhance;
