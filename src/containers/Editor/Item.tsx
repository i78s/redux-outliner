import Item from 'components/Editor/Item';
import {
  addNode,
} from 'modules/nodes';
import { State } from 'modules/store';
import { connect } from 'react-redux';
import { compose, withHandlers } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';

const mapDispatchToProps = (dispatch: Dispatch<State>) => (
  bindActionCreators(
    {
      addNode: () => addNode.started({}),
    },
    dispatch,
  )
);

interface DispatchFromProps {
  addNode: () => void;
}

export default compose<any, any>(
  connect(
    null, // stateを渡さないパターン
    mapDispatchToProps,
  ),
  withHandlers<DispatchFromProps, {}>({
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
         * 兄弟ノードを新規作成
         * 改行位置が末尾でないときは既存のノードの更新処理も必要
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
        // props.addNode();
      }
    },
    onPaste: props => (e: ClipboardEvent) => {
      e.preventDefault();
      const value: string = e.clipboardData.getData('text/plain');
      document.execCommand('insertHTML', false, value);
    },
  }),
)(Item);
