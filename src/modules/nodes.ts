import {
  findFocusIdAfterDelete,
  getNodesList,
  selectState,
} from 'modules/selectors';
import { delay, SagaIterator } from 'redux-saga';
import { all, call, fork, put, select, take, takeLatest } from 'redux-saga/effects';
import { NodeEntity } from 'services/models';
import nodesApi from 'services/nodes';
import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

export interface NodesState {
  list: NodeEntity[];
}

const initialState: NodesState = {
  list: [],
};

const actionCreator = actionCreatorFactory('NODES');

export const fetchNodes = actionCreator.async<
  {},
  { list: NodeEntity[] },
  Error
>('FETCH');

export const addNode = actionCreator.async<
  {},
  { list: NodeEntity[] },
  Error
>('CREATE');

export const editNode = actionCreator.async<
  {},
  { data: NodeEntity },
  Error
>('UPDATE');

export const removeNode = actionCreator.async<
  {},
  { list: NodeEntity[] },
  Error
>('DELETE');

export const updateCaret = actionCreator<{}>('UPDATE_CARET');

export default reducerWithInitialState(initialState)
  .cases(
    [
      fetchNodes.done,
      addNode.done,
      removeNode.done,
    ],
    (state, { result }) => ({ ...state, list: [ ...result.list ] }),
  )
  .case(
    editNode.done,
    (state, { result }) => {
      const list = state.list.map(node => {
        if (node.id === result.data.id) {
          return {
            ...node,
            ...result.data,
          };
        }

        return node;
      });

      return {
        ...state,
        list,
      };
    },
  )
  ;

export function* nodesTask() {
  yield all([
    fork(watchLoadNodes),
    fork(watchCreateNode),
    fork(watchUpdateNode),
    fork(watchDeleteNode),
  ]);
}

function* watchLoadNodes(): SagaIterator {
  yield takeLatest(fetchNodes.started, loadNodes);
}

function* loadNodes(action: any): SagaIterator {
  try {
    const list = yield call(
      nodesApi.getList,
    );
    yield put(fetchNodes.done({
      params: {},
      result: { list },
    }));

  } catch (error) {
    yield put(fetchNodes.failed({
      params: {},
      error: error as Error,
    }));
  }
}

function* watchCreateNode(): SagaIterator {
  yield takeLatest(addNode.started, createNode);
  yield takeLatest(addNode.done, changeNodeFocus);
}

function* createNode(action: any): SagaIterator {
  const payload = action.payload;

  try {
    const request: NodeEntity[] = yield all([
      // 新規作成
      // todo
      // 子がいる場合
      //  parent_idをpayload.nodeから取る
      //  orderの並び替えも子の中でやる
      call(
        nodesApi.post,
        {
          ...payload.node,
          title: payload.after,
          order: payload.node.order + 1,
          id: null,
        },
      ),
      // 既存nodeの更新
      // todo 末尾で改行された場合 (beforeが空文字なら処理が不要)
      call(
        nodesApi.put,
        {
          ...action.payload.node,
          title: payload.before,
        },
      ),
    ]);

    // todo
    // 並び替えはAPI側でやるようにする
    // 新規作成と更新が終わった後リストを取りなおすようにする
    const list: NodeEntity[] = yield selectState<NodeEntity[]>(getNodesList);
    const others = list
      .filter(el => el.id !== payload.node.id)
      .map(el => {
        if (
          el.parent_id === payload.node.parent_id &&
          request[0].order <= el.order
        ) {
          return { ...el, order: el.order + 1 };
        }

        return el;
      });
    Promise.all(
      others
        .filter(el => el.parent_id === payload.node.parent_id)
        .map(el => nodesApi.put(el)),
    );

    yield put(addNode.done({
      params: {
        id: request[0].id,
      },
      result: {
        list: [
          ...others,
          ...request,
        ],
      },
    }));
  } catch (error) {
    yield put(addNode.failed({
      params: {},
      error: error as Error,
    }));
  }
}

// 新規作成 / 削除時にフォーカスを移動する
// todo
// フォーカス / キャレットの移動をstateの変更でできるか
//  stateの変更でNodeコンポーネントのメソッドを発火？
function* changeNodeFocus(action: any): SagaIterator {
  const { id } = action.payload.params;
  const node: HTMLSpanElement | null = document.querySelector(`[data-id="${id}"]`);
  if (node) {
    node.focus();
  }
}

function* watchUpdateNode(): SagaIterator {
  yield takeLatest(editNode.started, updateNode);
  yield takeLatest(updateCaret, onUpdatedOnlyNode);
}

function* updateNode(action: any): SagaIterator {
  // todo
  // 待たせすぎると編集 -> Enterキー押下の感覚が短いとデータ不整合に見える
  // 値は即時でstateに反映してしまい通信は裏で投げっぱなしでも良さそう？
  yield call(delay, 100);

  try {
    const data = yield call(
      nodesApi.put,
      {
        ...action.payload,
      },
    );
    yield put(editNode.done({
      params: {},
      result: { data },
    }));

  } catch (error) {
    yield put(editNode.failed({
      params: {},
      error: error as Error,
    }));
  }
}

// nodeの変更のみ（Enterキー押下やで新規作成やdeleteキーでの削除を伴わない時）
// 更新後のAPIのデータが反映された後本来の位置にキャレットを移動する
function* onUpdatedOnlyNode(action: any): SagaIterator {
  yield take(editNode.done);

  const { target, range, startOffset, endOffset } = action.payload;

  if (target.firstChild) {
    // todo なんかエラー出るようになった
    range.setStart(target.firstChild, startOffset);
    range.setEnd(target.firstChild, endOffset);
  }
}

function* watchDeleteNode(): SagaIterator {
  yield takeLatest(removeNode.started, deleteNode);
  yield takeLatest(removeNode.done, changeNodeFocus);
}

function* deleteNode(action: any): SagaIterator {
  const payload = action.payload;
  const list: NodeEntity[] = yield selectState<NodeEntity[]>(getNodesList);
  const others = list.filter(el => el.id !== payload.node.id);
  const state = yield select();
  const focusId = findFocusIdAfterDelete(state, payload.node);

  if (focusId === 0) {
    return;
  }

  /**
   * todo
   * 子がいる
   *  focus移動先のnodeに子を引き継がせる
   */
  try {
    yield call(
      nodesApi.delete,
      payload.node.id,
    );
    yield put(removeNode.done({
      params: {
        id: focusId,
      },
      result: {
        list: [
          ...others,
        ],
      },
    }));

  } catch (error) {
    yield put(removeNode.failed({
      params: {},
      error: error as Error,
    }));
  }
}
