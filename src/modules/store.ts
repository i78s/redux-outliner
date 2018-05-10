import nodesReducer, { NodesState } from 'modules/nodes';
import rootTask from 'modules/tasks';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';

const rootReducer = combineReducers({
  nodes: nodesReducer,
});

export interface State {
  nodes: NodesState;
}

const sagaMiddleware = createSagaMiddleware();

const getMiddleware = () => {
  const applied = applyMiddleware(
    sagaMiddleware,
  );

  return process.env.NODE_ENV === 'production' ?
    applied : composeWithDevTools(applied);
};

export default createStore(
  rootReducer,
  getMiddleware(),
);
sagaMiddleware.run(rootTask);
