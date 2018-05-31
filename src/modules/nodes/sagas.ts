import * as actions from 'modules/nodes/actions';
import {
  findNodeOnBack,
  findNodeOnForward,
  findNodeToBeFocusedAfterDelete,
  getNodesAndDiffsAfterPromoted,
  getNodesAndDiffsAfterRelegate,
  getNodesAndReqParamBeforeCreate,
  getNodesAndReqParamBeforeDelete,
} from 'modules/nodes/getters';
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

function* loadNodes(action: actions.FetchNodesAction): SagaIterator {
  const { payload } = action;
  try {
    const list = yield call(
      nodesApi.getList,
    );
    yield put(actions.fetchNodes.done({
      params: { ...payload },
      result: { list },
    }));

  } catch (error) {
    yield put(actions.fetchNodes.failed({
      params: { ...payload },
      error: error as Error,
    }));
  }
}

function* createNode(action: actions.AddNodeAction): SagaIterator {
  const payload = action.payload;
  const { dividedTitle } = payload;
  const tmp: NodeEntity[] = yield selectState<NodeEntity[]>(getNodesList);
  const { list, req } = getNodesAndReqParamBeforeCreate(
    tmp,
    payload.node,
    [
      dividedTitle.left,
      dividedTitle.right,
    ],
  );

  try {
    const res: NodeEntity = yield call(
      nodesApi.post,
      req,
    );

    yield put(actions.addNode.done({
      params: { ...payload },
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
    if (dividedTitle.left) {
      requests.push(
        nodesApi.put({
          ...payload.node,
          title: payload.dividedTitle.left,
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
      params: { ...payload },
      error: error as Error,
    }));
  }
}

function* updateNode(action: actions.EditNodeAction): SagaIterator {
  yield call(delay, 100);
  const { payload } = action;
  const { node, rangeOffset } = payload;
  const list: NodeEntity[] = yield selectState<NodeEntity[]>(getNodesList);
  const others = list.filter(el => el.id !== node.id);
  try {
    const res = yield call(
      nodesApi.put,
      { ...node },
    );
    yield put(actions.editNode.done({
      params: { ...payload },
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
        start: rangeOffset.start,
        end: rangeOffset.end,
      },
    }));
  } catch (error) {
    yield put(actions.editNode.failed({
      params: { ...payload },
      error: error as Error,
    }));
  }
}

function* deleteNode(action: actions.DeleteNodeAction): SagaIterator {
  const { payload } = action;
  const { node, dividedTitle } = payload;
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
    dividedTitle.right,
  );

  try {
    yield put(actions.removeNode.done({
      params: { ...payload },
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
      params: { ...payload },
      error: error as Error,
    }));
  }
}

function* watchUpdateGradeNode(): SagaIterator {
  yield takeLatest(actions.promoteNode.started, promoteNode);
  yield takeLatest(actions.relegateNode.started, relegateNode);
}

function* promoteNode(action: actions.PromoteNodeAction): SagaIterator {
  const { payload } = action;
  const { node, rangeOffset } = payload;
  const tmp: NodeEntity[] = yield selectState<NodeEntity[]>(getNodesList);
  const { list, diff } = getNodesAndDiffsAfterPromoted(tmp, node);

  try {
    yield put(actions.promoteNode.done({
      params: { ...payload },
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
        start: rangeOffset.start,
        end: rangeOffset.end,
      },
    }));
  } catch (error) {
    yield put(actions.promoteNode.failed({
      params: { ...payload },
      error: error as Error,
    }));
  }
}

function* relegateNode(action: actions.RelegateNodeAction): SagaIterator {
  const { payload } = action;
  const { node, rangeOffset } = payload;
  const tmp: NodeEntity[] = yield selectState<NodeEntity[]>(getNodesList);
  const { list, diff } = getNodesAndDiffsAfterRelegate(tmp, node);

  try {
    yield put(actions.relegateNode.done({
      params: { ...payload },
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
        start: rangeOffset.start,
        end: rangeOffset.end,
      },
    }));
  } catch (error) {
    yield put(actions.relegateNode.failed({
      params: { ...payload },
      error: error as Error,
    }));
  }
}

function* watchOnKeyDownArrow(): SagaIterator {
  yield takeLatest(actions.goBack, goBack);
  yield takeLatest(actions.goForward, goForward);
}

export function* goBack(action: actions.GoBackAction): SagaIterator {
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

export function* goForward(action: actions.GoForwardAction): SagaIterator {
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
