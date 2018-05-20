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
    // Enterキーの起点のnodeを除外
    .filter(el => el.id !== payload.node.id)
    // 新規作成されたnodeの後ろにあるnodeの順番を更新
    .map(el => {
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
      params: {
        id: res[0].id,
      },
      result: {
        list: [
          ...others,
          ...res[0],
          ...res[1],
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

function* watchDeleteNode(): SagaIterator {
  yield takeLatest(removeNode.started, deleteNode);
  yield takeLatest(removeNode.done, changeNodeFocus);
}

function* deleteNode(action: any): SagaIterator {
  const payload = action.payload;
  const state = yield select();
  // todo findFocusIdAfterDeleteはgetter(state, payload.node)でいいのでは疑惑
  const focusId = findFocusIdAfterDelete(state, payload.node);

  if (focusId === 0) {
    return;
  }

  const list: NodeEntity[] = yield selectState<NodeEntity[]>(getNodesList);
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

// todo
// フォーカス / キャレットの移動をstateの変更で行いテスト可能にする
// changeNodeFocusとonUpdatedOnlyNodeを1つにまとめられそう？

// 新規作成 / 削除時にフォーカスを移動する
//  stateの変更でNodeコンポーネントのメソッドを発火？
function* changeNodeFocus(action: any): SagaIterator {
  const { id } = action.payload.params;
  const node: HTMLSpanElement | null = document.querySelector(`[data-id="${id}"]`);
  if (node) {
    node.focus();
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
