import {
  findNodeToBeFocusedAfterDelete,
  getNodesAndDiffsAfterPromoted,
  getNodesAndDiffsAfterRelegate,
  getNodesAndReqParamBeforeCreate,
} from 'modules/getters';
import * as actions from 'modules/nodes/actions';
import {
  getNodesList,
  selectState,
} from 'modules/selectors';
import { delay, SagaIterator } from 'redux-saga';
import { all, call, fork, put, takeLatest } from 'redux-saga/effects';
import { NodeEntity } from 'services/models';
import nodesApi from 'services/nodes';

export function* nodesTask() {
  yield all([
    fork(watchLoadNodes),
    fork(watchCreateNode),
    fork(watchUpdateNode),
    fork(watchDeleteNode),
    fork(watchPromoteNode),
    fork(watchRelegateNode),
  ]);
}

function* watchLoadNodes(): SagaIterator {
  yield takeLatest(actions.fetchNodes.started, loadNodes);
}

function* loadNodes(action: any): SagaIterator {
  try {
    const list = yield call(
      nodesApi.getList,
    );
    yield put(actions.fetchNodes.done({
      params: {},
      result: { list },
    }));

  } catch (error) {
    yield put(actions.fetchNodes.failed({
      params: {},
      error: error as Error,
    }));
  }
}

function* watchCreateNode(): SagaIterator {
  yield takeLatest(actions.addNode.started, createNode);
}

function* createNode(action: any): SagaIterator {
  const payload = action.payload;
  const tmp: NodeEntity[] = yield selectState<NodeEntity[]>(getNodesList);
  const { list, req } = getNodesAndReqParamBeforeCreate(tmp, payload);

  try {
    const res: NodeEntity = yield call(
      nodesApi.post,
      req,
    );

    yield put(actions.addNode.done({
      params: {},
      result: {
        list: [
          ...list,
          res,
        ],
      },
    }));
    // フォーカス/キャレット位置を変更
    yield put(actions.setFocus({
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

    // todo 並び替えはAPI側でやるようにする
    requests.push(...list
      .filter(el => el.parent_id === req.parent_id)
      .map(el => nodesApi.put(el),
    ));

  } catch (error) {
    yield put(actions.addNode.failed({
      params: {},
      error: error as Error,
    }));
  }
}

function* watchUpdateNode(): SagaIterator {
  yield takeLatest(actions.editNode.started, updateNode);
}

function* updateNode(action: any): SagaIterator {
  yield call(delay, 100);
  const { start, end, node } = action.payload;
  const list: NodeEntity[] = yield selectState<NodeEntity[]>(getNodesList);
  const others = list.filter(el => el.id !== node.id);
  try {
    const res = yield call(
      nodesApi.put,
      { ...node },
    );
    yield put(actions.editNode.done({
      params: {},
      result: {
        list: [
          ...others,
          res,
        ],
      },
    }));
    // フォーカス/キャレット位置を変更
    yield call(delay, 16);
    yield put(actions.setFocus({
      focus: {
        id: res.id,
        start,
        end,
      },
    }));
  } catch (error) {
    yield put(actions.editNode.failed({
      params: {},
      error: error as Error,
    }));
  }
}

function* watchDeleteNode(): SagaIterator {
  yield takeLatest(actions.removeNode.started, deleteNode);
}

function* deleteNode(action: any): SagaIterator {
  const { after, node } = action.payload;
  const list: NodeEntity[] = yield selectState<NodeEntity[]>(getNodesList);
  const focus = findNodeToBeFocusedAfterDelete(list, node);

  if (focus === null || focus.id === 0) {
    return;
  }
  const to = focus!;

  const others = list
    // フォーカス移動先と削除されるnodeを弾き
    .filter(el => el.id !== node.id)
    .filter(el => el.id !== to.id)
    .map(el => {
      if (
        el.parent_id === node.parent_id &&
        el.order > node.order
      ) {
        // 消すnodeの分orderを前につめる
        return {
          ...el,
          order: el.order - 1,
        };
      }
      // 削除されるnodeに子がいる場合は引き継ぐ
      if (el.parent_id === node.id) {
        return {
          ...el,
          parent_id: to.id!,
        };
      }

      return el;
    });

  const target = {
    ...to,
    title: to.title + after,
  };

  try {
    yield put(actions.removeNode.done({
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
    // todo 削除時にtitleが空になるバグがあるっぽい
    yield put(actions.setFocus({
      focus: {
        id: to.id!,
        start: len,
        end: len,
      },
    }));
    // 画面反映のラグを作らない為バックグランドで通信を行う
    const requests = [
      nodesApi.delete(node.id),
    ];
    // キャレットの右に文字が存在したらnodeの更新
    if (after) {
      requests.push(
        nodesApi.put(target),
      );
    }
    // todo バックエンド側でやりたい
    requests.push(  // 並び順の更新
      ...others
        .filter(el => el.parent_id === node.parent_id && el.order > to.order)
        .map(el => nodesApi.put(el)),
    );
    const child = others.filter(el => el.parent_id === to.id);
    if (child.length !== 0) { // 子の引き継ぎ
      requests.push(...child.map(el => {
        return nodesApi.put(el);
      }));
    }

  } catch (error) {
    yield put(actions.removeNode.failed({
      params: {},
      error: error as Error,
    }));
  }
}

function* watchPromoteNode(): SagaIterator {
  yield takeLatest(actions.promoteNode.started, promoteNode);
}

function* promoteNode(action: any): SagaIterator {
  const { node, start, end } = action.payload;
  const tmp: NodeEntity[] = yield selectState<NodeEntity[]>(getNodesList);
  const { list, diff } = getNodesAndDiffsAfterPromoted(tmp, node);

  try {
    yield put(actions.promoteNode.done({
      params: {},
      result: {
        list,
      },
    }));
    Promise.all([ // 変更をバックエンドにも反映
      ...diff.map(el => {
        return nodesApi.put(el);
      }),
    ]);
    // キャレット位置の整合性を取る
    yield call(delay, 16);
    yield put(actions.setFocus({
      focus: {
        id: node.id!,
        start,
        end,
      },
    }));
  } catch (error) {
    yield put(actions.promoteNode.failed({
      params: {},
      error: error as Error,
    }));
  }
}

function* watchRelegateNode(): SagaIterator {
  yield takeLatest(actions.relegateNode.started, relegateNode);
}

function* relegateNode(action: any): SagaIterator {
  const { node, start, end } = action.payload;
  const tmp: NodeEntity[] = yield selectState<NodeEntity[]>(getNodesList);
  const { list, diff } = getNodesAndDiffsAfterRelegate(tmp, node);

  try {
    yield put(actions.relegateNode.done({
      params: {},
      result: {
        list,
      },
    }));
    Promise.all([ // 変更をバックエンドにも反映
      ...diff.map(el => {
        return nodesApi.put(el);
      }),
    ]);
    // キャレット位置の整合性を取る
    yield call(delay, 16);
    yield put(actions.setFocus({
      focus: {
        id: node.id!,
        start,
        end,
      },
    }));
  } catch (error) {
    yield put(actions.relegateNode.failed({
      params: {},
      error: error as Error,
    }));
  }
}
