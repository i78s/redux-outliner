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
  // nodes変更後のキャレット移動
  yield takeLatest(actions.addNode.done, afterCreateNode);
  yield takeLatest(actions.editNode.done, afterUpdateNode);
}

export function* loadNodes(action: actions.FetchNodesAction): SagaIterator {
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

export function* createNode(action: actions.AddNodeAction): SagaIterator {
  const payload = action.payload;
  const { node, dividedTitle } = payload;
  const tmp: NodeEntity[] = yield selectState<NodeEntity[]>(getNodesList);
  const { list, req } = getNodesAndReqParamBeforeCreate(
    tmp,
    node,
    dividedTitle,
  );

  try {
    const res: NodeEntity = yield call(
      nodesApi.post,
      req,
    );

    yield put(actions.addNode.done({
      params: {
        dividedTitle,
        node: res,  // キャレット位置を移動のため新規nodeに変更する
      },
      result: {
        list: [
          ...list,
          res,
        ],
      },
    }));
    // nodeの末尾でEnterでなければ既存nodeの更新
    if (dividedTitle.right) {
      yield call(
        nodesApi.put, {
          ...node,
          title: dividedTitle.left,
        },
      );
    }
    // todo 並び替えはAPI側でやるようにする
    yield all([
      ...list
        .filter(el => (
          el.parent_id === req.parent_id &&
          req.order < el.order
        ))
        .map(el => call(nodesApi.put, el)),
    ]);
  } catch (error) {
    yield put(actions.addNode.failed({
      params: { ...payload },
      error: error as Error,
    }));
  }
}

export function* afterCreateNode(action: actions.AddNodeDoneAction): SagaIterator {
  // フォーカス/キャレット位置を変更
  yield put(actions.setFocus({
    focus: {
      id: action.payload.params.node.id,
      start: 0,
      end: 0,
    },
  }));
}

export function* updateNode(action: actions.EditNodeAction): SagaIterator {
  yield call(delay, 100);
  const { payload } = action;
  const { node } = payload;
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
  } catch (error) {
    yield put(actions.editNode.failed({
      params: { ...payload },
      error: error as Error,
    }));
  }
}

export function* afterUpdateNode(action: actions.EditNodeDoneAction): SagaIterator {
  const { node, rangeOffset } = action.payload.params;
  // フォーカス/キャレット位置を変更
  yield put(actions.setFocus({
    focus: {
      id: node.id,
      start: rangeOffset.start,
      end: rangeOffset.end,
    },
  }));
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
