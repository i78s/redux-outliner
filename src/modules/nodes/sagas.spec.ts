import * as actions from 'modules/nodes/actions';
import * as sagas from 'modules/nodes/sagas';
import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { throwError } from 'redux-saga-test-plan/providers';
import nodesApi from 'services/nodes';

describe('loadNodes', () => {
  it('通信成功時はFETCH_DONEを呼ぶこと', () => {
    const res = [
      {
        id: 1,
        title: 'hoge',
        order: 0,
        parent_id: 0,
        project_id: 1,
      },
    ];

    return expectSaga(sagas.loadNodes, {
      payload: {},
    })
      .provide([
        [matchers.call.fn(nodesApi.getList), res],
      ])
      .put({
        type: 'NODES/FETCH_DONE',
        payload: {
          params: {},
          result: { list: res },
        },
      })
      .run();
  });
  it('通信失敗時はFETCH_DONEを呼ぶこと', () => {
    const error = new Error('error');

    return expectSaga(sagas.loadNodes, {
      payload: {},
    })
      .provide([
        [matchers.call.fn(nodesApi.getList), throwError(error)],
      ])
      .put({
        type: 'NODES/FETCH_FAILED',
        payload: {
          params: {},
          error,
        },
        error: true,
      })
      .run();
  });
});

describe('goBack', () => {
  const list = [
    {
      id: 1,
      title: 'hoge',
      order: 0,
      parent_id: 0,
      project_id: 1,
    },
    {
      id: 2,
      title: 'bar',
      order: 1,
      parent_id: 0,
      project_id: 1,
    },
  ];
  const state = {
    nodes: {
      focus: {
        timestamp: 0,
        id: 0,
        start: 0,
        end: 0,
      },
      list,
    },
  };
  it('後ろに移動できないときはsetFocusを呼ばないこと', () => {
    return expectSaga(sagas.goBack, {
      payload: {
        node: list[0],
      },
    })
      .withState(state)
      .not.put.actionType(actions.setFocus.type)
      .run();
  });
  it('後ろに移動できるときはsetFocusを呼ぶこと', () => {
    return expectSaga(sagas.goBack, {
      payload: {
        node: list[1],
      },
    })
      .withState(state)
      .put({
        type: 'NODES/SET_FOCUS',
        payload: {
          focus: {
            id: 1,
            start: list[0].title.length,
            end: list[0].title.length,
          },
        },
      })
      .run();
  });
});

describe('goForward', () => {
  const list = [
    {
      id: 1,
      title: 'hoge',
      order: 0,
      parent_id: 0,
      project_id: 1,
    },
    {
      id: 2,
      title: 'bar',
      order: 1,
      parent_id: 0,
      project_id: 1,
    },
  ];
  const state = {
    nodes: {
      focus: {
        timestamp: 0,
        id: 0,
        start: 0,
        end: 0,
      },
      list,
    },
  };
  it('前に移動できないときはsetFocusを呼ばないこと', () => {
    return expectSaga(sagas.goForward, {
      payload: {
        node: list[1],
      },
    })
      .withState(state)
      .not.put.actionType(actions.setFocus.type)
      .run();
  });
  it('前に移動できるときはsetFocusを呼ぶこと', () => {
    return expectSaga(sagas.goForward, {
      payload: {
        node: list[0],
      },
    })
      .withState(state)
      .put({
        type: 'NODES/SET_FOCUS',
        payload: {
          focus: {
            id: 2,
            start: 0,
            end: 0,
          },
        },
      })
      .run();
  });
});
