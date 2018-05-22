import {
  findFocusNodeAfterDelete,
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

  try {
    const res: NodeEntity = yield call(
      nodesApi.post,
      {
        ...payload.node,
        title: payload.after,
        order,
        id: null,
      },
    );

    yield put(addNode.done({
      params: {},
      result: {
        list: [
          ...others,
          res,
        ],
      },
    }));
    // フォーカス/キャレット位置を変更
    yield put(setFocus({
      focus: {
        id: res.id!,
        start: 0,
        end: 0,
      },
    }));
    // キャレット移動が終わってからその他のnodeの更新を開始
    const requests = [];
    // nodeの末尾でEnterでなければ既存nodeの更新
    if (payload.before) {
      requests.push(
        nodesApi.put({
          ...action.payload.node,
          title: payload.before,
        }),
      );
    }

    // todo
    // 並び替えはAPI側でやるようにする
    const sibling = others
      .filter(el => el.parent_id === payload.node.parent_id);
    requests.push(...sibling.map(el => {
      return nodesApi.put(el);
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
  const focus = findFocusNodeAfterDelete(list, payload.node);

  if (focus && focus.id === 0) {
    return;
  }
  const to = focus!;

  const others = list
    // フォーカス移動先と削除されるnodeを弾き
    .filter(el => el.id !== payload.node.id)
    .filter(el => el.id !== to.id)
    .map(el => {
      // todo workflowyとは仕様が異なる どうするかあとで検討
      // 削除されるnodeに子がいる場合は引き継ぐ
      if (el.parent_id === payload.node.id) {
        return {
          ...el,
          parent_id: to.id!,
        };
      }

      return el;
    });

  const target = {
    ...to,
    title: to.title + payload.after,
  };

  try {
    yield put(removeNode.done({
      params: {},
      result: {
        list: [
          ...others,
          target,
        ],
      },
    }));
    // フォーカス/キャレット位置を変更
    // todo 待たせないとうまく動かなかった
    yield call(delay, 16);

    const len = to.title.length;
    yield put(setFocus({
      focus: {
        id: to.id!,
        start: len,
        end: len,
      },
    }));
    // キャレット移動が終わってからその他のnodeの更新を開始
    const requests = [
      nodesApi.delete(payload.node.id),
    ];
    // キャレットの右に文字が存在したらnodeの更新
    if (payload.after) {
      requests.push(
        nodesApi.put(target),
      );
    }
    // todo バックエンド側でやりたい
    const child = others.filter(el => el.parent_id === to.id);
    if (child.length !== 0) {
      requests.push(...child.map(el => {
        return nodesApi.put(el);
      }));
    }

  } catch (error) {
    yield put(removeNode.failed({
      params: {},
      error: error as Error,
    }));
  }
}
