import { connect } from 'react-redux';
import {
  compose,
  lifecycle,
  mapProps,
  withHandlers,
  withState,
} from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';

import Item, { ItemProps } from 'components/Editor/Item';
import { NodesFocus } from 'modules/nodes';
import {
  addNode,
  editNode,
  goBack,
  goForward,
  promoteNode,
  relegateNode,
  removeNode,
} from 'modules/nodes/actions';
import { State } from 'modules/store';
import { NodeEntity } from 'services/models';

interface OuterProps {
  node: NodeEntity;
}

interface StateFromProps {
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

type WithHandlersProp = OuterProps &
  StateFromProps &
  DispatchFromProps &
  WithStateProps &
  RefProps;

interface HandlerProps {
  onInput: (e: any) => void;
  onKeyDown: (e: any) => void;
  onKeyUp: (e: any) => void;
  onPaste: (e: any) => void;
  moveCaret: (props: any) => void;
}

type EnhancedProps = WithHandlersProp & HandlerProps;

type ItemKeyEvent = KeyboardEvent & HTMLElementEvent<HTMLDivElement>;

const mapStateToProps = (state: State) => ({
  focus: state.nodes.focus,
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      addNode: (node, left, right) =>
        addNode.started({
          node,
          dividedTitle: {
            left,
            right,
          },
        }),
      editNode: (node, start, end) =>
        editNode.started({
          node,
          rangeOffset: {
            start,
            end,
          },
        }),
      removeNode: (node, left, right) =>
        removeNode.started({
          node,
          dividedTitle: {
            left,
            right,
          },
        }),
      relegateNode: (node, start, end) =>
        relegateNode.started({
          node,
          rangeOffset: {
            start,
            end,
          },
        }),
      promoteNode: (node, start, end) =>
        promoteNode.started({
          node,
          rangeOffset: {
            start,
            end,
          },
        }),
      goBack: node => goBack({ node }),
      goForward: node => goForward({ node }),
    },
    dispatch,
  );

export default compose<EnhancedProps, OuterProps>(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withState('isComposing', 'setComposing', false),
  withHandlers<{}, RefProps>(() => {
    const refs: any = {};

    return {
      setRef: props => content => (refs.content = content),
      getRef: props => () => refs.content,
    };
  }),
  withHandlers<WithHandlersProp, HandlerProps>({
    onInput: props => (e: HTMLElementEvent<HTMLDivElement>) => {
      if (props.isComposing) {
        return;
      }
      update(props, e.target);
    },
    onKeyDown: props => (e: ItemKeyEvent) => {
      props.setComposing(e.keyCode === 229);
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
      if (props.isComposing && e.keyCode === 13) {
        update(props, e.target);
      }
    },
    onPaste: props => (e: ClipboardEvent) => {
      e.preventDefault();
      const value: string = e.clipboardData.getData('text/plain');
      document.execCommand('insertHTML', false, value);
    },
    moveCaret: props => (prevProps: WithHandlersProp) => {
      const { focus, node } = props;
      // focusに変更がない時は何もしない
      if (prevProps.focus.timestamp === focus.timestamp) {
        return;
      }
      // 対象のnodeでなければ何もしない
      if (focus.id !== node.id) {
        return;
      }

      const ref = props.getRef();
      const firstChild = ref.firstChild;
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      // innerTextが空だとfirstChildがnullなのでフォーカス変更のみ
      if (!firstChild) {
        ref.focus();

        return;
      }
      range.setStart(firstChild, focus.start);
      range.setEnd(firstChild, focus.end);
      selection.removeAllRanges();
      selection.addRange(range);
    },
  }),
  lifecycle<EnhancedProps, {}, {}>({
    componentDidUpdate(prevProps: EnhancedProps) {
      prevProps.moveCaret(prevProps);
    },
  }),
  mapProps<ItemProps, EnhancedProps>(
    ({ node, onInput, onPaste, onKeyDown, onKeyUp, setRef }) => ({
      node,
      onInput,
      onPaste,
      onKeyDown,
      onKeyUp,
      setRef,
    }),
  ),
)(Item);

const update = (props: WithHandlersProp, target: HTMLDivElement) => {
  const title = target.innerText;
  const { startOffset, endOffset } = getSelectionRange();

  props.editNode({ ...props.node, title }, startOffset, endOffset);
};

const onKeyDownEnter = (props: WithHandlersProp, e: ItemKeyEvent) => {
  e.preventDefault();
  const text = e.target.innerText;
  const { startOffset, endOffset } = getSelectionRange();
  const left = text.slice(0, startOffset);
  const right = text.slice(endOffset);

  props.addNode(props.node, left, right);
};

const onKeyDownDelete = (props: WithHandlersProp, e: ItemKeyEvent) => {
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

const onKeyDownTab = (props: WithHandlersProp, e: KeyboardEvent) => {
  e.preventDefault();
  const { startOffset, endOffset } = getSelectionRange();
  props.relegateNode(props.node, startOffset, endOffset);
};

const onKeyDownShiftTab = (props: WithHandlersProp, e: KeyboardEvent) => {
  e.preventDefault();
  const { startOffset, endOffset } = getSelectionRange();
  props.promoteNode(props.node, startOffset, endOffset);
};

const onKeyDownLeft = onKeyUpOrLeft;
const onKeyDownUp = onKeyUpOrLeft;
const onKeyDownRight = onKeyDownOrRight;
const onKeyDownDown = onKeyDownOrRight;

function onKeyDownOrRight(props: WithHandlersProp, e: KeyboardEvent) {
  const { startOffset, endOffset } = getSelectionRange();
  const len = props.node.title.length;
  if (startOffset === len && endOffset === len) {
    e.preventDefault();
    props.goForward(props.node);
  }
}

function onKeyUpOrLeft(props: WithHandlersProp, e: KeyboardEvent) {
  const { startOffset, endOffset } = getSelectionRange();
  if (startOffset === 0 && endOffset === 0) {
    e.preventDefault();
    props.goBack(props.node);
  }
}

function getSelectionRange(): Range {
  return window.getSelection().getRangeAt(0);
}
