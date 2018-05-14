import * as React from 'react';
import { NodeEntity } from 'services/models';
import styled from 'styled-components';

interface StateFromProps {
  node: NodeEntity;
}

export interface HandlerProps {
  onInput: (e: any) => void;
  onKeyDown: (e: any) => void;
  onKeyUp: (e: any) => void;
  onPaste: (e: any) => void;
}

export type ItemProps = StateFromProps & HandlerProps;

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
  onKeyUp,
}) => {

  return (
    <Content
      suppressContentEditableWarning={true}
      contentEditable={true}
      onInput={onInput}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onPaste={onPaste}
      data-id={node.id}
      data-order={node.order}
    >
      {node.title}
    </Content>
  );
};

export default Item;

const Content = styled.div`
  min-height: 20px;
`;
