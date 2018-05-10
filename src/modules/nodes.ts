import { SagaIterator } from 'redux-saga';
import { all, call, fork, put, takeLatest } from 'redux-saga/effects';
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

export const setNodes = actionCreator<{
  list: NodeEntity[],
}>('SET');

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

export default reducerWithInitialState(initialState)
  .case(
    fetchNodes.done,
    (state, { result }) => ({ ...state, list: result.list }),
  )
  .case(
    setNodes,
    (state, { list }) => ({ ...state, list }),
  )
  // todo 画面に反映する
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
    (state, { result }) => ({ ...state }),
  )
  ;

export function* nodesTask() {
  yield all([
    fork(watchLoadNodes),
    fork(watchCreateNode),
    fork(watchUpdateNode),
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
}

function* createNode(action: any): SagaIterator {
  try {
    const data = yield call(
      nodesApi.post,
      {
        ...action.payload,
        id: null,
        parent_id: action.payload.id,
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

function* watchUpdateNode(): SagaIterator {
  yield takeLatest(editNode.started, updateNode);
}

function* updateNode(action: any): SagaIterator {
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
