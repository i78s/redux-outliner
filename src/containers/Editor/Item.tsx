import Item, { HandlerProps, ItemProps, RefProps } from 'components/Editor/Item';
import { addNode, editNode, removeNode } from 'modules/nodes';
import { State } from 'modules/store';
import { connect } from 'react-redux';
import { compose, lifecycle, withHandlers, withState } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';
import { NodeEntity } from 'services/models';

interface DispatchFromProps {
  addNode: (before: string, after: string, node: NodeEntity) => void;
  editNode: (node: NodeEntity) => void;
  removeNode: (before: string, after: string, node: NodeEntity) => void;
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
      editNode: node => editNode.started(node),
      removeNode: (before, after, node) =>
        removeNode.started({
          before,
          after,
          node,
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
        // todo 矢印キーでの移動
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
      if (prevProps.focus.id === focus.id) {
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

  props.editNode({
    ...props.node,
    title,
  });
};

const onKeyDownEnter = (props: WithHandlersProp, target: HTMLDivElement) => {
  const text = target.innerText;
  const selection = window.getSelection();
  const { startOffset, endOffset } = selection.getRangeAt(0);
  const before = text.slice(0, startOffset);
  const after = text.slice(endOffset);

  props.addNode(before, after, props.node);
};

const onKeyDownDelete = (props: WithHandlersProp, target: HTMLDivElement, e: KeyboardEvent) => {
  const text = target.innerText;
  const selection = window.getSelection();
  const { startOffset, endOffset } = selection.getRangeAt(0);
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
  /**
   * todo
   * 直前の兄弟が存在すればparent_idを直前の兄弟のidに変更
   */
  // tslint:disable-next-line:no-console
  console.log('tab');
};

const onKeyDownShiftTab = (props: WithHandlersProp, target: HTMLDivElement) => {
  /**
   * todo
   * 親が存在すればparent_idを親のidに変更
   */
  // tslint:disable-next-line:no-console
  console.log('shift + tab');
};
