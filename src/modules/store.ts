import { applyMiddleware, combineReducers, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';
import { all, fork } from 'redux-saga/effects';

import nodesReducer, { NodesState, nodesTask } from '~/modules/nodes';

const rootReducer = combineReducers({
  nodes: nodesReducer,
});

export interface State {
  nodes: NodesState;
}

const sagaMiddleware = createSagaMiddleware();

const getMiddleware = () => {
  const applied = applyMiddleware(sagaMiddleware);

  return process.env.NODE_ENV === 'production'
    ? applied
    : composeWithDevTools(applied);
};

export default createStore(rootReducer, getMiddleware());
sagaMiddleware.run(rootTask);

function* rootTask() {
  yield all([fork(nodesTask)]);
}
