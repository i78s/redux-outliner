import { NodesFocus } from 'modules/nodes';
import { NodeEntity } from 'services/models';
import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory('NODES');

export type FetchNodesAction = AbstractAction;
export const fetchNodes = actionCreator.async<
  FetchNodesAction['payload'],
  { list: NodeEntity[] },
  Error
>('FETCH');

export interface AddNodeAction extends AbstractAction {
  payload: {
    node: NodeEntity;
    before: string;
    after: string;
  };
}
export const addNode = actionCreator.async<
  AddNodeAction['payload'],
  { list: NodeEntity[] },
  Error
>('CREATE');

export interface EditNodeAction extends AbstractAction {
  payload: {
    node: NodeEntity;
    start: number;
    end: number;
  };
}
export const editNode = actionCreator.async<
  EditNodeAction['payload'],
  { list: NodeEntity[] },
  Error
>('UPDATE');

export interface DeleteNodeAction extends AbstractAction {
  payload: {
    node: NodeEntity;
    before: string;
    after: string;
  };
}
export const removeNode = actionCreator.async<
  DeleteNodeAction['payload'],
  { list: NodeEntity[] },
  Error
>('DELETE');

export const setFocus = actionCreator<{
  focus: NodesFocus,
}>('SET_FOCUS');

export interface PromoteNodeAction extends AbstractAction {
  payload: {
    node: NodeEntity;
    start: number;
    end: number;
  };
}
export const promoteNode = actionCreator.async<
  PromoteNodeAction['payload'],
  { list: NodeEntity[] },
  Error
>('PROMOTE_NODE');

export interface RelegateNodeAction extends AbstractAction {
  payload: {
    node: NodeEntity;
    start: number;
    end: number;
  };
}
export const relegateNode = actionCreator.async<
  RelegateNodeAction['payload'],
  { list: NodeEntity[] },
  Error
>('RELEGATE_NODE');

export interface GoBackAction extends AbstractAction {
  payload: {
    node: NodeEntity;
  };
}
export const goBack = actionCreator<GoBackAction['payload']>('GO_BACK');

export interface GoForwardAction extends AbstractAction {
  payload: {
    node: NodeEntity;
  };
}
export const goForward = actionCreator<GoForwardAction['payload']>('GO_FORWARD');
