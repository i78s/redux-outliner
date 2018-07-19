import * as React from 'react';
import styled from 'styled-components';

import { NodeEntity } from 'services/models';

export interface ItemProps {
  node: NodeEntity;
  onInput: (e: any) => void;
  onKeyDown: (e: any) => void;
  onKeyUp: (e: any) => void;
  onPaste: (e: any) => void;
  setRef: (e: any) => void;
}

const Item: React.SFC<ItemProps> = ({
  node,
  onInput,
  onPaste,
  onKeyDown,
  onKeyUp,
  setRef,
}) => {
  return (
    <Node>
      <Dot />
      <div
        className="content"
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
    </Node>
  );
};

export default Item;

const Node = styled.div`
  position: relative;
  .content {
    margin-bottom: 8px;
    padding-left: 18px;
    outline: none;
    line-height: 22px;
  }
`;

const Dot = styled.div`
  position: absolute;
  top: 8px;
  left: 0;
  width: 7px;
  height: 7px;
  background-color: #333;
  border-radius: 50%;
`;
