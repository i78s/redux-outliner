import {
  findFocusIdAfterDelete,
  getNodesList,
  selectState,
} from 'modules/selectors';
import { delay, SagaIterator } from 'redux-saga';
import { all, call, fork, put, takeLatest } from 'redux-saga/effects';
import { NodeEntity } from 'services/models';
import nodesApi from 'services/nodes';
import actionCreatorFactory from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

export interface NodesFocus {
  id: number;
  start: number;
  end: number;
}

export interface NodesState {
  focus: NodesFocus;
  list: NodeEntity[];
}

const initialState: NodesState = {
  focus: {
    id: 0,
    start: 0,
    end: 0,
  },
  list: [],
};

const actionCreator = actionCreatorFactory('NODES');

export const fetchNodes = actionCreator.async<
  {},
  { list: NodeEntity[] },
  Error
>('FETCH');

export const addNode = actionCreator.async<
  { before?: string; after?: string; node?: NodeEntity },
  { list: NodeEntity[] },
  Error
>('CREATE');

export const editNode = actionCreator.async<
  {},
  {},
  Error
>('UPDATE');

export const removeNode = actionCreator.async<
  { before?: string; after?: string; node?: NodeEntity },
  { list: NodeEntity[] },
  Error
>('DELETE');

const setFocus = actionCreator<{
  focus: NodesFocus,
}>('SET_FOCUS');

export default reducerWithInitialState(initialState)
  .cases(
    [
      fetchNodes.done,
      addNode.done,
      removeNode.done,
    ],
    (state, { result }) => ({ ...state, list: [ ...result.list ] }),
  )
  .case(setFocus, (state, { focus }) => ({ ...state, focus: { ...focus } }))
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
}

function* createNode(action: any): SagaIterator {
  const payload = action.payload;
  const order = payload.node.order + 1;

  const request = [
    // 新規作成
    call(
      nodesApi.post,
      {
        ...payload.node,
        title: payload.after,
        order,
        id: null,
      },
    ),
  ];

  // nodeの末尾でEnterでなければ既存nodeの更新
  if (payload.before) {
    request.push(call(
      nodesApi.put,
      {
        ...action.payload.node,
        title: payload.before,
      },
    ));
  }

  const list: NodeEntity[] = yield selectState<NodeEntity[]>(getNodesList);
  const others = list
    .map(el => {
      // Enterキーの起点のnodeを更新
      if (el.id === payload.node.id) {
        return {
          ...el,
          title: payload.before,
        };
      }

      // 新規作成されたnodeの後ろにあるnodeの順番を更新
      if (
        el.parent_id === payload.node.parent_id &&
        order <= el.order
      ) {
        return { ...el, order: el.order + 1 };
      }

      return el;
    });

  // todo
  // 並び替えはAPI側でやるようにする
  const sibling = others
    .filter(el => el.parent_id === payload.node.parent_id);
  request.push(...sibling.map(el => {
    return call(
      nodesApi.put,
      el,
    );
  }));

  try {
    const res = yield all(request);

    yield put(addNode.done({
      params: {},
      result: {
        list: [
          ...others,
          ...res[0],
        ],
      },
    }));
    // フォーカス/キャレット位置を変更
    yield put(setFocus({
      focus: {
        id: res[0].id,
        start: 0,
        end: 0,
      },
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
  yield call(delay, 100);

  try {
    yield call(
      nodesApi.put,
      {
        ...action.payload,
      },
    );
    /**
     * 変更時ajaxは投げっぱなしに
     * 状態はDOMに持たせるのでreducerでは何もしない
     * 結果キャレットの移動処理もブラウザに任せられる
     */
    yield put(editNode.done({
      params: {},
      result: {},
    }));

  } catch (error) {
    yield put(editNode.failed({
      params: {},
      error: error as Error,
    }));
  }
}

function* watchDeleteNode(): SagaIterator {
  yield takeLatest(removeNode.started, deleteNode);
}

function* deleteNode(action: any): SagaIterator {
  const payload = action.payload;
  const list: NodeEntity[] = yield selectState<NodeEntity[]>(getNodesList);
  const focusId = findFocusIdAfterDelete(list, payload.node);

  if (focusId === 0) {
    return;
  }

  const others = list
    // 削除されるnodeを弾き
    .filter(el => el.id !== payload.node.id)
    .map(el => {
      // todo workflowyとは仕様が異なる どうするかあとで検討
      // 削除されるnodeに子がいる場合は引き継ぐ
      if (el.parent_id === payload.node.id) {
        return {
          ...el,
          parent_id: focusId,
        };
      }

      return el;
    });

  const request = [
    call(
      nodesApi.delete,
      payload.node.id,
    ),
  ];

  // todo バックエンド側でやりたい
  const child = others.filter(el => el.parent_id === focusId);
  if (child.length !== 0) {
    request.push(...child.map(el => {
      return call(
        nodesApi.put,
        el,
      );
    }));
  }

  try {
    yield all(request);
    yield put(removeNode.done({
      params: {},
      result: {
        list: [
          ...others,
        ],
      },
    }));
    // フォーカス/キャレット位置を変更
    yield put(setFocus({
      focus: {
        id: focusId,
        start: 0,
        end: 0,
      },
    }));
  } catch (error) {
    yield put(removeNode.failed({
      params: {},
      error: error as Error,
    }));
  }
}
