import * as React from 'react';
import { NodeEntity } from 'services/models';

interface StateFromProps {
  node: NodeEntity;
}

export interface DispatchFromProps {
  onInput: () => void;
  onKeyDown: () => void;
  onPaste: () => void;
}

type ItemProps = StateFromProps & DispatchFromProps;

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

export default Item;
