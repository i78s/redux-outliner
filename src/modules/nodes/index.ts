import * as actions from 'modules/nodes/actions';
import { NodeEntity } from 'services/models';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

export interface NodesFocus {
  id: number;
  start: number;
  end: number;
}

export interface NodesState {
  focus: NodesFocus;
  list: NodeEntity[];
}

const initialState: NodesState = {
  focus: {
    id: 0,
    start: 0,
    end: 0,
  },
  list: [],
};

export default reducerWithInitialState(initialState)
  .cases(
    [
      actions.fetchNodes.done,
      actions.addNode.done,
      actions.removeNode.done,
      actions.relegateNode.done,
      actions.promoteNode.done,
    ],
    (state, { result }) => ({ ...state, list: [ ...result.list ] }),
  )
  .case(actions.setFocus, (state, { focus }) => ({ ...state, focus: { ...focus } }))
  ;
