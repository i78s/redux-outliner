import { NodesFocus } from 'modules/nodes';
import * as React from 'react';
import { NodeEntity } from 'services/models';
import styled from 'styled-components';

export interface OuterProps {
  node: NodeEntity;
}

interface StateFromProps extends OuterProps {
  focus: NodesFocus;
}

interface DispatchFromProps {
  addNode: (node: NodeEntity, left: string, right: string) => void;
  editNode: (node: NodeEntity, start: number, end: number) => void;
  removeNode: (node: NodeEntity, left: string, right: string) => void;
  relegateNode: (node: NodeEntity, start: number, end: number) => void;
  promoteNode: (node: NodeEntity, start: number, end: number) => void;
  goBack: (node: NodeEntity) => void;
  goForward: (node: NodeEntity) => void;
}

interface WithStateProps {
  isComposing: boolean;
  setComposing: (isComposing: boolean) => boolean;
}

export interface RefProps {
  setRef: (e: any) => void;
  getRef: () => HTMLDivElement;
}

export type WithHandlersProp = StateFromProps & DispatchFromProps & WithStateProps & RefProps;

export interface HandlerProps {
  onInput: (e: any) => void;
  onKeyDown: (e: any) => void;
  onKeyUp: (e: any) => void;
  onPaste: (e: any) => void;
  moveCaret: (props: any) => void;
}

export type EnhancedProps = StateFromProps & DispatchFromProps & WithStateProps & RefProps & HandlerProps;

const Item: React.SFC<EnhancedProps> = ({
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
