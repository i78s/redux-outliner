import { getNodesList, selectState } from 'modules/selectors';
import { delay, SagaIterator } from 'redux-saga';
import { all, call, fork, put, take, takeLatest } from 'redux-saga/effects';
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
  {},
  Error
>('DELETE');

export const updateCaret = actionCreator<{}>('UPDATE_CARET');

export default reducerWithInitialState(initialState)
  .cases(
    [
      fetchNodes.done,
      addNode.done,
    ],
    (state, { result }) => ({ ...state, list: result.list }),
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
      call(
        nodesApi.post,
        {
          ...payload.node,
          title: payload.after,
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

    const tmp: NodeEntity[] = yield selectState<NodeEntity[]>(getNodesList);
    const list = tmp
      .filter(el => el.id !== payload.node.id)
      .map(el => {
        if (el.parent_id !== payload.node.parent_id) {
          return el;
        }

        // todo 並び替え処理がバグってる
        // 編集元のnodeのorderより前か後ろかを考慮する
        return { ...el, order: el.order + 1 };
      });

    yield put(addNode.done({
      params: {
        id: request[0].id,
      },
      result: {
        list: [
          ...list,
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
  yield call(delay, 500);

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
    range.setStart(target.firstChild, startOffset);
    range.setEnd(target.firstChild, endOffset);
  }
}

function* watchDeleteNode(): SagaIterator {
  yield takeLatest(removeNode.started, deleteNode);
}

function* deleteNode(action: any): SagaIterator {
  try {
    const data = yield call(
      nodesApi.delete,
      {
        ...action.payload,
      },
    );
    yield put(removeNode.done({
      params: {},
      result: { data },
    }));

  } catch (error) {
    yield put(removeNode.failed({
      params: {},
      error: error as Error,
    }));
  }
}
