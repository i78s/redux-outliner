import Item, { HandlerProps, ItemProps } from 'components/Editor/Item';
import { addNode, editNode, removeNode } from 'modules/nodes';
import { State } from 'modules/store';
import { connect } from 'react-redux';
import { compose, withHandlers, withState } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';
import { NodeEntity } from 'services/models';

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

export default compose<any, any>(
  connect(
    null, // stateを渡さないパターン
    mapDispatchToProps,
  ),
  withState('isComposing', 'setComposing', false),
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
  /**
   * todo
   * フォーカス移動時にキャレットを末尾に
   * キャレットより右に文字がある / ない
   *  異動先にキャレットより右の文字を引き継がせる
   */
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
