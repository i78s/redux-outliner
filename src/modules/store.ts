import nodesReducer from 'modules/nodes';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

const rootReducer = combineReducers({
  nodes: nodesReducer,
});

const getMiddleware = () => {
  const applied = applyMiddleware();

  return process.env.NODE_ENV === 'production' ?
    applied : composeWithDevTools(applied);
};

export default createStore(
  rootReducer,
  getMiddleware(),
);
