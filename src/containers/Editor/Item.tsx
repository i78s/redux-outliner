import Item, { HandlerProps, ItemProps } from 'components/Editor/Item';
import { addNode, editNode, updateCaret } from 'modules/nodes';
import { State } from 'modules/store';
import { connect } from 'react-redux';
import { compose, withHandlers, withState } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';
import { NodeEntity } from 'services/models';

const mapDispatchToProps = (dispatch: Dispatch<State>) =>
  bindActionCreators(
    {
      addNode: (title, node) =>
        addNode.started({
          ...node,
          title,
        }),
      editNode: node => editNode.started(node),
      updateCaret: data => updateCaret(data),
    },
    dispatch,
  );

interface DispatchFromProps {
  addNode: (title: string, node: NodeEntity) => void;
  editNode: (node: NodeEntity) => void;
  updateCaret: (data: any) => void;
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
    onInput: props => (e: InputEvent<HTMLSpanElement>) => {
      if (props.isComposing) {
        return;
      }
      update(props, e.target);
    },
    onKeyDown: props => (e: KeyboardEvent & InputEvent<HTMLSpanElement>) => {
      props.setComposing(e.keyCode === 229);

      if (e.keyCode === 13) {
        e.preventDefault();
        /**
         * todo
         * 更新/作成時に並び順を指定する
         */

        const text = e.target.innerText;
        const selection = window.getSelection();
        const { startOffset, endOffset } = selection.getRangeAt(0);
        const before = text.slice(0, startOffset);
        const after = text.slice(endOffset);

        props.editNode({
          ...props.node,
          title: before,
        });
        props.addNode(after, props.node);
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
  /**
   * todo
   * イベントの間引きが必要
   * 空文字になったとき かつ 子がいなければ削除
   *  フォーカス位置を直前の兄弟 / 親に移動する
   */

  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const { startOffset, endOffset } = range;

  const title = target.innerText;

  props.editNode(
    {
      ...props.node,
      title,
    },
  );
  props.updateCaret({
    target,
    range,
    startOffset,
    endOffset,
  });
};
