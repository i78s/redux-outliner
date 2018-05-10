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
      // const value = e.target.value;

      // tslint:disable-next-line:no-console
      console.dir(e.target.innerText);
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
        // tslint:disable-next-line:no-console
        console.dir({
          before,
          after,
        });
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
