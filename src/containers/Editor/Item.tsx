import Item, { HandlerProps, ItemProps, RefProps } from 'components/Editor/Item';
import {
  addNode,
  editNode,
  promoteNode,
  relegateNode,
  removeNode,
} from 'modules/nodes/actions';
import { State } from 'modules/store';
import { connect } from 'react-redux';
import { compose, lifecycle, withHandlers, withState } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';
import { NodeEntity } from 'services/models';

interface DispatchFromProps {
  addNode: (before: string, after: string, node: NodeEntity) => void;
  editNode: (node: NodeEntity, start: number, end: number) => void;
  removeNode: (before: string, after: string, node: NodeEntity) => void;
  relegateNode: (node: NodeEntity, start: number, end: number) => void;
  promoteNode: (node: NodeEntity, start: number, end: number) => void;
}

interface WithStateProps {
  isComposing: boolean;
  setComposing: (isComposing: boolean) => boolean;
}

type WithHandlersProp = DispatchFromProps & WithStateProps & ItemProps;

const mapStateToProps = (state: State) => ({
  focus: state.nodes.focus,
});

const mapDispatchToProps = (dispatch: Dispatch<State>) =>
  bindActionCreators(
    {
      addNode: (before, after, node) =>
        addNode.started({
          before,
          after,
          node,
        }),
      editNode: (node, start, end) => editNode.started({
        node,
        start,
        end,
      }),
      removeNode: (before, after, node) =>
        removeNode.started({
          before,
          after,
          node,
        }),
      relegateNode: (node, start, end) => relegateNode.started({
        node,
        start,
        end,
      }),
      promoteNode: (node, start, end) => promoteNode.started({
        node,
        start,
        end,
      }),
    },
    dispatch,
  );

export default compose<any, any>(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withState('isComposing', 'setComposing', false),
  withHandlers<WithHandlersProp, RefProps>(() => {
    const refs: any = {};

    return {
      setRef: props => content => (refs.content = content),
      getRef: props => () => refs.content,
    };
  }),
  withHandlers<WithHandlersProp, HandlerProps>({
    onInput: props => (e: InputEvent<HTMLDivElement>) => {
      if (props.isComposing) {
        return;
      }
      update(props, e.target);
    },
    onKeyDown: props => (e: KeyboardEvent & InputEvent<HTMLDivElement>) => {
      props.setComposing(e.keyCode === 229);
      switch (e.keyCode) {
        case 8:
          onKeyDownDelete(props, e.target, e);
          break;
        case 9:
          e.preventDefault();
          e.shiftKey ? onKeyDownShiftTab(props, e.target) : onKeyDownTab(props, e.target);
          break;
        case 13:
          e.preventDefault();
          onKeyDownEnter(props, e.target);
          break;
        case 37:
          onKeyDownLeft(props, e.target);
          break;
        case 38:
          onKeyDownUp(props, e.target);
          break;
        case 39:
          onKeyDownRight(props, e.target);
          break;
        case 40:
          onKeyDownDown(props, e.target);
          break;
        default:
          break;
      }
    },
    onKeyUp: props => (e: KeyboardEvent) => {
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
  lifecycle<WithHandlersProp, {}, {}>({
    componentDidUpdate(prevProps: WithHandlersProp) {
      prevProps.moveCaret(prevProps);
    },
  }),
)(Item);

const update = (props: WithHandlersProp, target: any) => {
  const title = target.innerText;
  const { startOffset, endOffset } = getSelectionRange();

  props.editNode(
    { ...props.node, title },
    startOffset,
    endOffset,
  );
};

const onKeyDownEnter = (props: WithHandlersProp, target: HTMLDivElement) => {
  const text = target.innerText;
  const { startOffset, endOffset } = getSelectionRange();
  const before = text.slice(0, startOffset);
  const after = text.slice(endOffset);

  props.addNode(before, after, props.node);
};

const onKeyDownDelete = (props: WithHandlersProp, target: HTMLDivElement, e: KeyboardEvent) => {
  const text = target.innerText;
  const { startOffset, endOffset } = getSelectionRange();
  const before = text.slice(0, startOffset);
  const after = text.slice(endOffset);

  // 末尾でdeleteじゃないなら止める
  if (before && text) {
    return;
  }

  // nodeのテキスト全選択 -> delした時は一旦止める
  if (startOffset === 0 && endOffset === text.length && text) {
    return;
  }

  // updateのリクエストさせたくないのでinputイベントを発火させないようにする
  e.preventDefault();
  props.removeNode(before, after, props.node);
};

const onKeyDownTab = (props: WithHandlersProp, target: HTMLDivElement) => {
  const { startOffset, endOffset } = getSelectionRange();
  props.relegateNode(props.node, startOffset, endOffset);
};

const onKeyDownShiftTab = (props: WithHandlersProp, target: HTMLDivElement) => {
  const { startOffset, endOffset } = getSelectionRange();
  props.promoteNode(props.node, startOffset, endOffset);
};

const onKeyDownLeft = (props: WithHandlersProp, target: HTMLDivElement) => {
  // tslint:disable-next-line:no-console
  console.log('left');
};
const onKeyDownRight = (props: WithHandlersProp, target: HTMLDivElement) => {
  // tslint:disable-next-line:no-console
  console.log('right');
};
const onKeyDownUp = (props: WithHandlersProp, target: HTMLDivElement) => {
  // tslint:disable-next-line:no-console
  console.log('up');
};
const onKeyDownDown = (props: WithHandlersProp, target: HTMLDivElement) => {
  // tslint:disable-next-line:no-console
  console.log('down');
};

function getSelectionRange(): Range {
  return window.getSelection().getRangeAt(0);
}
