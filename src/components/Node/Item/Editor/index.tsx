import * as React from 'react';
import { connect } from 'react-redux';
import { compose, lifecycle, withHandlers } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';

import { NodeEntity } from '~/models/node';
import { nodeActions } from '~/modules/nodes';
import { State } from '~/modules/store';

import Input from '~/components/Node/Item/Editor/Input';

interface OuterProps {
  node: NodeEntity;
}

interface ConnectedProps {
  id: number;
  focus: any;
  addNode: (node: NodeEntity, left: string, right: string) => void;
  editNode: (node: NodeEntity, start: number, end: number) => void;
  removeNode: (node: NodeEntity, left: string, right: string) => void;
  relegateNode: (node: NodeEntity, start: number, end: number) => void;
  promoteNode: (node: NodeEntity, start: number, end: number) => void;
  goBack: (node: NodeEntity) => void;
  goForward: (node: NodeEntity) => void;
}

interface KeyHandlersProp {
  onInput: (e: any) => void;
  onKeyDown: (e: any) => void;
  onKeyUp: (e: any) => void;
}

interface CaretHandlersProps {
  setRef: (e: any) => void;
  getRef: () => HTMLDivElement;
}

type EnhancedProps = OuterProps &
  ConnectedProps &
  KeyHandlersProp &
  CaretHandlersProps;

type ItemKeyEvent = KeyboardEvent & HTMLElementEvent<HTMLDivElement>;

const mapStateToProps = (state: State) => ({
  focus: state.nodes.focus,
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      addNode: (node, left, right) =>
        nodeActions.addNode.started({
          node,
          dividedTitle: {
            left,
            right,
          },
        }),
      editNode: (node, start, end) =>
        nodeActions.editNode.started({
          node,
          rangeOffset: {
            start,
            end,
          },
        }),
      removeNode: (node, left, right) =>
        nodeActions.removeNode.started({
          node,
          dividedTitle: {
            left,
            right,
          },
        }),
      relegateNode: (node, start, end) =>
        nodeActions.relegateNode.started({
          node,
          rangeOffset: {
            start,
            end,
          },
        }),
      promoteNode: (node, start, end) =>
        nodeActions.promoteNode.started({
          node,
          rangeOffset: {
            start,
            end,
          },
        }),
      goBack: node => nodeActions.goBack({ node }),
      goForward: node => nodeActions.goForward({ node }),
    },
    dispatch,
  );

const keyHandlers = withHandlers<EnhancedProps, KeyHandlersProp>({
  onInput: props => (e: ItemKeyEvent) => {
    update(props, e.target);
  },
  onKeyDown: props => (e: ItemKeyEvent) => {
    switch (e.keyCode) {
      case 8:
        onKeyDownDelete(props, e);
        break;
      case 9:
        e.shiftKey ? onKeyDownShiftTab(props, e) : onKeyDownTab(props, e);
        break;
      case 13:
        onKeyDownEnter(props, e);
        break;
      case 37:
        onKeyDownLeft(props, e);
        break;
      case 38:
        onKeyDownUp(props, e);
        break;
      case 39:
        onKeyDownRight(props, e);
        break;
      case 40:
        onKeyDownDown(props, e);
        break;
      default:
        break;
    }
  },
  onKeyUp: props => (e: ItemKeyEvent) => {
    update(props, e.target);
  },
});

const caretHandlers = compose<CaretHandlersProps, ConnectedProps>(
  withHandlers<{}, CaretHandlersProps>(() => {
    const refs: any = {};

    return {
      setRef: props => content => (refs.content = content),
      getRef: props => () => refs.content,
    };
  }),
  lifecycle<EnhancedProps, {}, {}>({
    componentDidUpdate(prevProps: EnhancedProps) {
      const { focus, node, getRef } = this.props;

      // focusに変更がない時は何もしない
      if (prevProps.focus.timestamp === focus.timestamp) {
        return;
      }
      // 対象のnodeでなければ何もしない
      if (focus.id !== node.id) {
        return;
      }

      const inputRef = getRef();
      const firstChild = inputRef.firstChild;
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      // innerTextが空だとfirstChildがnullなのでフォーカス変更のみ
      if (!firstChild) {
        inputRef.focus();
        return;
      }

      range.setStart(firstChild, focus.start);
      range.setEnd(firstChild, focus.end);
      selection.removeAllRanges();
      selection.addRange(range);
    },
  }),
);

export default compose<EnhancedProps, OuterProps>(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  keyHandlers,
  caretHandlers,
)(({ node, onInput, onKeyDown, onKeyUp, setRef }) => {
  return (
    <Input
      inputRef={setRef}
      initialValue={node.title}
      onInput={onInput}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
    />
  );
});

const update = (props: EnhancedProps, target: HTMLDivElement) => {
  const title = target.innerText;
  const { startOffset, endOffset } = getSelectionRange();

  props.editNode({ ...props.node, title }, startOffset, endOffset);
};

const onKeyDownEnter = (props: EnhancedProps, e: ItemKeyEvent) => {
  e.preventDefault();
  const text = e.target.innerText;
  const { startOffset, endOffset } = getSelectionRange();
  const left = text.slice(0, startOffset);
  const right = text.slice(endOffset);

  props.addNode(props.node, left, right);
};

const onKeyDownDelete = (props: EnhancedProps, e: ItemKeyEvent) => {
  const text = e.target.innerText;
  const { startOffset, endOffset } = getSelectionRange();
  const left = text.slice(0, startOffset);
  const right = text.slice(endOffset);

  // 末尾でdeleteじゃないなら止める
  if (left) {
    return;
  }

  // nodeのテキスト全選択 -> delした時は一旦止める
  if (startOffset === 0 && endOffset === text.length && text) {
    return;
  }

  // updateのリクエストさせたくないのでinputイベントを発火させないようにする
  e.preventDefault();
  props.removeNode(props.node, left, right);
};

const onKeyDownTab = (props: EnhancedProps, e: KeyboardEvent) => {
  e.preventDefault();
  const { startOffset, endOffset } = getSelectionRange();
  props.relegateNode(props.node, startOffset, endOffset);
};

const onKeyDownShiftTab = (props: EnhancedProps, e: KeyboardEvent) => {
  e.preventDefault();
  const { startOffset, endOffset } = getSelectionRange();
  props.promoteNode(props.node, startOffset, endOffset);
};

const onKeyDownLeft = onKeyUpOrLeft;
const onKeyDownUp = onKeyUpOrLeft;
const onKeyDownRight = onKeyDownOrRight;
const onKeyDownDown = onKeyDownOrRight;

function onKeyDownOrRight(props: EnhancedProps, e: KeyboardEvent) {
  const { startOffset, endOffset } = getSelectionRange();
  const len = props.node.title.length;
  if (startOffset === len && endOffset === len) {
    e.preventDefault();
    props.goForward(props.node);
  }
}

function onKeyUpOrLeft(props: EnhancedProps, e: KeyboardEvent) {
  const { startOffset, endOffset } = getSelectionRange();
  if (startOffset === 0 && endOffset === 0) {
    e.preventDefault();
    props.goBack(props.node);
  }
}

function getSelectionRange(): Range {
  return window.getSelection().getRangeAt(0);
}
