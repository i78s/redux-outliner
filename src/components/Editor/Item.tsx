import { NodesFocus } from 'modules/nodes';
import * as React from 'react';
import { NodeEntity } from 'services/models';
import styled from 'styled-components';

interface Props {
  focus: NodesFocus;
  node: NodeEntity;
}

export interface RefProps {
  setRef: (e: any) => void;
  getRef: () => HTMLDivElement;
}

export interface HandlerProps {
  onInput: (e: any) => void;
  onKeyDown: (e: any) => void;
  onKeyUp: (e: any) => void;
  onPaste: (e: any) => void;
  moveCaret: (props: any) => void;
}

export type ItemProps = Props & RefProps & HandlerProps;

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
  setRef,
}) => {

  return (
    <Style>
      <div
        suppressContentEditableWarning={true}
        contentEditable={true}
        onInput={onInput}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onPaste={onPaste}
        ref={setRef}
      >
        {node.title}
      </div>
    </Style>
  );
};

export default Item;

const Style = styled.div`
  div {
    position: relative;
    margin-bottom: 8px;
    padding-left: 15px;
    outline: none;

    &:before {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      margin: auto;
      width: 5px;
      height: 5px;
      background-color: #333;
      border-radius: 50%;
    }
  }
`;
