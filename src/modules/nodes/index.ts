import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { NodeEntity } from '~/models/node';
import * as actions from './actions';
import { nodesTask } from './operations';
import * as selectors from './selectors';

export { selectors as nodeSelectors };
export { actions as nodeActions };
export { nodesTask };

export interface NodesState {
  focus: actions.NodesFocus;
  list: NodeEntity[];
}

const initialState: NodesState = {
  focus: {
    timestamp: 0,
    id: 0,
    start: 0,
    end: 0,
  },
  list: [],
};

export default reducerWithInitialState(initialState)
  // reducerでpayload見ないのでanyでいいかなという気持ち
  .cases<any>(
    [
      actions.fetchNodes.done,
      actions.addNode.done,
      actions.editNode.done,
      actions.removeNode.done,
      actions.relegateNode.done,
      actions.promoteNode.done,
    ],
    (state, { result }) => ({ ...state, list: [...result.list] }),
  )
  .case(actions.setFocus, (state, { focus }) => {
    return {
      ...state,
      focus: {
        ...focus,
        timestamp: Date.now(),
      },
    };
  });
