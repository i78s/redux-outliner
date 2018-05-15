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
  { data: NodeEntity },
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
  .case(
    fetchNodes.done,
    (state, { result }) => ({ ...state, list: result.list }),
  )
  .case(
    addNode.done,
    (state, { result }) => {

      return {
        ...state,
        list: [
          ...state.list,
          result.data,
        ],
      };
    },
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
  const list: NodeEntity[] = yield selectState<NodeEntity[]>(getNodesList);
  // tslint:disable-next-line:no-console
  console.log(list);
  try {
    const data = yield call(
      nodesApi.post,
      {
        ...action.payload,
        id: null,
      },
    );
    yield put(addNode.done({
      params: {},
      result: { data },
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
  const { data } = action.payload.result;
  const node: HTMLSpanElement | null = document.querySelector(`[data-id="${data.id}"]`);
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
