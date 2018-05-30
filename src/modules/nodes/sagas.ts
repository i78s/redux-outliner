import {
  findNodeOnBack,
  findNodeOnForward,
  findNodeToBeFocusedAfterDelete,
  getNodesAndDiffsAfterPromoted,
  getNodesAndDiffsAfterRelegate,
  getNodesAndReqParamBeforeCreate,
  getNodesAndReqParamBeforeDelete,
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
    fork(watchCRUDNodes),
    fork(watchUpdateGradeNode),
    fork(watchOnKeyDownArrow),
  ]);
}

function* watchCRUDNodes(): SagaIterator {
  yield takeLatest(actions.fetchNodes.started, loadNodes);
  yield takeLatest(actions.addNode.started, createNode);
  yield takeLatest(actions.editNode.started, updateNode);
  yield takeLatest(actions.removeNode.started, deleteNode);
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
        id: res.id,
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

function* deleteNode(action: any): SagaIterator {
  const { after, node } = action.payload;
  const tmp: NodeEntity[] = yield selectState<NodeEntity[]>(getNodesList);
  const focus = findNodeToBeFocusedAfterDelete(tmp, node);

  if (focus === null || focus.id === 0) {
    return;
  }
  const to = focus!;

  const { list, req } = getNodesAndReqParamBeforeDelete(
    tmp,
    node,
    to,
    after,
  );

  try {
    yield put(actions.removeNode.done({
      params: {},
      result: {
        list,
      },
    }));
    // フォーカス/キャレット位置を変更
    // todo 待たせないとうまく動かなかった
    yield call(delay, 16);

    const len = to.title.length;
    // todo 削除時にtitleが空になるバグがあるっぽい
    yield put(actions.setFocus({
      focus: {
        id: to.id,
        start: len,
        end: len,
      },
    }));
    // 画面反映のラグを作らない為バックグランドで通信を行う
    const requests = [
      nodesApi.delete(node.id),
    ];
    // キャレットの右に文字が存在したらnodeの更新
    if (req) {
      requests.push(
        nodesApi.put(req),
      );
    }
    // todo バックエンド側でやりたい
    const others = list.filter(el => el.id === to.id);
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

function* watchUpdateGradeNode(): SagaIterator {
  yield takeLatest(actions.promoteNode.started, promoteNode);
  yield takeLatest(actions.relegateNode.started, relegateNode);
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
        id: node.id,
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
        id: node.id,
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

function* watchOnKeyDownArrow(): SagaIterator {
  yield takeLatest(actions.goBack, goBack);
  yield takeLatest(actions.goForward, goForward);
}

function* goBack(action: any): SagaIterator {
  const { node } = action.payload;
  const list: NodeEntity[] = yield selectState<NodeEntity[]>(getNodesList);
  const target = findNodeOnBack(list, node);

  if (!target) {
    return;
  }
  const len = target.title.length;
  yield put(actions.setFocus({
    focus: {
      id: target.id,
      start: len,
      end: len,
    },
  }));
}

function* goForward(action: any): SagaIterator {
  const { node } = action.payload;
  const list: NodeEntity[] = yield selectState<NodeEntity[]>(getNodesList);
  const target = findNodeOnForward(list, node);

  if (!target) {
    return;
  }
  yield put(actions.setFocus({
    focus: {
      id: target.id,
      start: 0,
      end: 0,
    },
  }));
}
