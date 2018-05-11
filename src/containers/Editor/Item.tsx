import Item, { HandlerProps, ItemProps } from 'components/Editor/Item';
import {
  addNode,
  editNode,
} from 'modules/nodes';
import { State } from 'modules/store';
import { connect } from 'react-redux';
import { compose, withHandlers } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';
import { NodeEntity } from 'services/models';

const mapDispatchToProps = (dispatch: Dispatch<State>) => (
  bindActionCreators(
    {
      addNode: (title, node) => addNode.started({
        ...node,
        title,
      }),
      editNode: (node) => editNode.started(node),
    },
    dispatch,
  )
);

interface DispatchFromProps {
  addNode: (title: string, node: NodeEntity) => void;
  editNode: (node: NodeEntity) => void;
}

export default compose<any, any>(
  connect(
    null, // stateを渡さないパターン
    mapDispatchToProps,
  ),
  withHandlers<DispatchFromProps & ItemProps, HandlerProps>({
    onInput: props => (e: InputEvent<HTMLSpanElement>) => {
      /**
       * todo
       * 変更時にアップデートする
       * 空文字になったとき かつ 子がいなければ削除
       *  フォーカス位置を直前の兄弟 / 親に移動する
       */
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const { startOffset, endOffset } = range;

      const target = e.target;
      const title = target.innerText;

      props.editNode(
        {
          ...props.node,
          title,
        },
      );

      setTimeout(
        () => {
          if (target.firstChild) {
            range.setStart(target.firstChild, startOffset);
            range.setEnd(target.firstChild, endOffset);
          }
        },
        16);
    },
    onKeyDown: props => (e: KeyboardEvent & InputEvent<HTMLSpanElement>) => {
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
    onPaste: props => (e: ClipboardEvent) => {
      e.preventDefault();
      const value: string = e.clipboardData.getData('text/plain');
      document.execCommand('insertHTML', false, value);
    },
  }),
)(Item);
