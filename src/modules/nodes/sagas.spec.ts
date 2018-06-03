import * as actions from 'modules/nodes/actions';
import * as sagas from 'modules/nodes/sagas';
import { delay } from 'redux-saga';
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

describe('createNode', () => {
  describe('通信成功時', () => {
    describe('Enter押下時にキャレットがタイトルの末尾', () => {
      it('起点のnodeに変更がなく、タイトルが空文字列のnodeが新規作成されること', () => {
        const list = [
          {
            id: 1,
            title: 'hoge',
            order: 0,
            parent_id: 0,
            project_id: 1,
          },
        ];
        const res = {
          id: 2,
          title: '',
          order: 1,
          parent_id: 0,
          project_id: 1,
        };
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
        const payload = {
          node: list[0],
          dividedTitle: {
            left: 'hoge',
            right: '',
          },
        };

        return expectSaga(sagas.createNode, {
          payload,
        })
          .withState(state)
          .provide([
            [matchers.call.fn(nodesApi.post), res],
          ])
          .put({
            type: 'NODES/CREATE_DONE',
            payload: {
              params: {
                dividedTitle: payload.dividedTitle,
                node: res,
              },
              result: { list: [list[0], res ] },
            },
          })
          .call(nodesApi.post, { id: null, title: '', order: 1, parent_id: 0, project_id: 1 })
          .not.call(nodesApi.put)
          .run();
      });
    });
    describe('Enter押下時にキャレットがタイトルの末尾でない', () => {
      it('起点のnodeのタイトルが更新され、キャレット右側を引き継いだnodeが新規作成されること', () => {
        const list = [
          {
            id: 1,
            title: 'hoge',
            order: 0,
            parent_id: 0,
            project_id: 1,
          },
        ];
        const res = {
          id: 2,
          title: 'ge',
          order: 1,
          parent_id: 0,
          project_id: 1,
        };
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
        const payload = {
          node: list[0],
          dividedTitle: {
            left: 'ho',
            right: 'ge',
          },
        };
        const updated = {
          ...list[0],
          title: 'ho',
        };

        return expectSaga(sagas.createNode, {
          payload,
        })
          .withState(state)
          .provide([
            [matchers.call.fn(nodesApi.post), res],
            [matchers.call.fn(nodesApi.put), updated],
          ])
          .put({
            type: 'NODES/CREATE_DONE',
            payload: {
              params: {
                dividedTitle: payload.dividedTitle,
                node: res,
              },
              result: { list: [updated, res ] },
            },
          })
          .call(nodesApi.post, { id: null, title: 'ge', order: 1, parent_id: 0, project_id: 1 })
          .call(nodesApi.put, updated)
          .run();
      });
    });
  });
});

describe('afterCreateNode', () => {
  it('SET_FOCUSが呼ばれること', () => {
    const payload = {
      params: {
        node: {
          id: 1,
          title: '',
          order: 0,
          parent_id: 1,
          project_id: 1,
        },
      },
    };

    return expectSaga(sagas.afterCreateNode, {
      payload,
    })
      .put({
        type: 'NODES/SET_FOCUS',
        payload: {
          focus: {
            id: payload.params.node.id,
            start: 0,
            end: 0,
          },
        },
      })
      .run();
  });
});

describe('updateNode', () => {
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
      title: 'foo',
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
  const updated = {
    id: 2,
    title: 'fo',
    order: 1,
    parent_id: 0,
    project_id: 1,
  };
  const payload = {
    node: updated,
    rangeOffset: {
      start: 2,
      end: 2,
    },
  };
  it('遅延実行前でupdateNodeが呼ばれていないこと', () => {
    return expectSaga(sagas.updateNode, {
      payload,
    })
      .call(delay, 100)
      .not.call.fn(nodesApi.put)
      .silentRun(50);
  });
  describe('通信成功時', () => {
    it('起点のnodeのみを更新した一覧を返すこと', () => {
      return expectSaga(sagas.updateNode, {
        payload,
      })
        .withState(state)
        .provide([
          [matchers.call.fn(nodesApi.put), updated],
        ])
        .call(delay, 100)
        .put({
          type: 'NODES/UPDATE_DONE',
          payload: {
            params: payload,
            result: { list: [list[0], updated ] },
          },
        })
        .call(nodesApi.put, { id: 2, title: 'fo', order: 1, parent_id: 0, project_id: 1 })
        .run();
    });
  });
});

describe('afterUpdateNode', () => {
  it('SET_FOCUSが呼ばれること', () => {
    const payload = {
      params: {
        node: {
          id: 1,
          title: 'hoge',
          order: 0,
          parent_id: 1,
          project_id: 1,
        },
        rangeOffset: {
          start: 1,
          end: 1,
        },
      },
    };

    return expectSaga(sagas.afterUpdateNode, {
      payload,
    })
      .put({
        type: 'NODES/SET_FOCUS',
        payload: {
          focus: {
            id: payload.params.node.id,
            start: payload.params.rangeOffset.start,
            end: payload.params.rangeOffset.end,
          },
        },
      })
      .run();
  });
});

describe('deleteNode', () => {
  it('削除ができない要件の時は処理を中断すること', () => {
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
        title: 'foo',
        order: 1,
        parent_id: 0,
        project_id: 1,
      },
      {
        id: 3,
        title: 'bar',
        order: 2,
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
    const payload = {
      node: list[0],
      dividedTitle: {
        left: '',
        right: '',
      },
    };

    return expectSaga(sagas.deleteNode, {
      payload,
    })
      .withState(state)
      .not.put.actionType(actions.removeNode.done)
      .not.call.fn(nodesApi.put)
      .run();
  });
  it('削除対象を除外した一覧をresultに返すこと', () => {
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
        title: 'foo',
        order: 1,
        parent_id: 0,
        project_id: 1,
      },
      {
        id: 3,
        title: 'bar',
        order: 2,
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
    const payload = {
      node: list[2],
      dividedTitle: {
        left: '',
        right: '',
      },
    };

    return expectSaga(sagas.deleteNode, {
      payload,
    })
      .withState(state)
      .provide([
        [matchers.call(nodesApi.delete, 3), {}],
      ])
      .put({
        type: actions.removeNode.done.type,
        payload: {
          params: {
            node: list[1],
            dividedTitle: payload.dividedTitle,
          },
          result: {
            list: [list[0], list[1]],
          },
        },
      })
      .not.call(nodesApi.put)
      .run();
  });
  it('削除後タイトルを引き継ぐこと', () => {
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
        title: 'foo',
        order: 1,
        parent_id: 0,
        project_id: 1,
      },
      {
        id: 3,
        title: 'bar',
        order: 2,
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
    const payload = {
      node: list[2],
      dividedTitle: {
        left: '',
        right: 'ar',
      },
    };
    const updated = {
      ...list[1],
      title: `${list[1].title}${payload.dividedTitle.right}`,
    };

    return expectSaga(sagas.deleteNode, {
      payload,
    })
      .withState(state)
      .provide([
        [matchers.call(nodesApi.delete, 3), {}],
        [matchers.call(nodesApi.put, updated), updated],
      ])
      .put({
        type: actions.removeNode.done.type,
        payload: {
          params: {
            node: list[1],
            dividedTitle: payload.dividedTitle,
          },
          result: {
            list: [list[0], updated],
          },
        },
      })
      .call(nodesApi.put, updated)
      .run();
  });
  it('削除対象に弟がいる場合orderを前に詰めること', () => {
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
        title: 'foo',
        order: 1,
        parent_id: 0,
        project_id: 1,
      },
      {
        id: 3,
        title: 'bar',
        order: 2,
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
    const payload = {
      node: list[1],
      dividedTitle: {
        left: '',
        right: '',
      },
    };
    const updated = { ...list[2], order: 1 };

    return expectSaga(sagas.deleteNode, {
      payload,
    })
      .withState(state)
      .provide([
        [matchers.call(nodesApi.delete, 2), {}],
        [matchers.call(nodesApi.put, updated), updated],
      ])
      .put({
        type: actions.removeNode.done.type,
        payload: {
          params: {
            node: list[0],
            dividedTitle: payload.dividedTitle,
          },
          result: {
            list: [list[0], updated],
          },
        },
      })
      .call(nodesApi.put, updated)
      .run();
  });
  it('削除対象に子がいる場合は親の引き継ぎを行うこと', () => {
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
        title: 'foo',
        order: 1,
        parent_id: 0,
        project_id: 1,
      },
      {
        id: 3,
        title: 'bar',
        order: 2,
        parent_id: 0,
        project_id: 1,
      },
      {
        id: 4,
        title: 'baz',
        order: 0,
        parent_id: 3,
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
    const payload = {
      node: list[2],
      dividedTitle: {
        left: '',
        right: '',
      },
    };
    const updated = { ...list[3], parent_id: 2 };

    return expectSaga(sagas.deleteNode, {
      payload,
    })
      .withState(state)
      .provide([
        [matchers.call(nodesApi.delete, 3), {}],
        [matchers.call(nodesApi.put, updated), updated],
      ])
      .put({
        type: actions.removeNode.done.type,
        payload: {
          params: {
            node: list[1],
            dividedTitle: payload.dividedTitle,
          },
          result: {
            list: [list[0], list[1], updated],
          },
        },
      })
      .call(nodesApi.put, updated)
      .run();
  });
});

describe('afterDeleteNode', () => {
  it('SET_FOCUSが呼ばれること', () => {
    const payload = {
      params: {
        node: {
          id: 1,
          title: 'hoge',
          order: 0,
          parent_id: 1,
          project_id: 1,
        },
      },
    };

    return expectSaga(sagas.afterDeleteNode, {
      payload,
    })
    .put({
      type: 'NODES/SET_FOCUS',
      payload: {
        focus: {
          id: payload.params.node.id,
          start: payload.params.node.title.length,
          end: payload.params.node.title.length,
        },
      },
    })
      .run();
  });
});

describe('afterPromoteNode', () => {
  it('SET_FOCUSが呼ばれること', () => {
    const payload = {
      params: {
        node: {
          id: 1,
          title: 'hoge',
          order: 0,
          parent_id: 1,
          project_id: 1,
        },
        rangeOffset: {
          start: 1,
          end: 1,
        },
      },
    };

    return expectSaga(sagas.afterPromoteNode, {
      payload,
    })
    .put({
      type: 'NODES/SET_FOCUS',
      payload: {
        focus: {
          id: payload.params.node.id,
          start: payload.params.rangeOffset.start,
          end: payload.params.rangeOffset.end,
        },
      },
    })
      .run();
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
