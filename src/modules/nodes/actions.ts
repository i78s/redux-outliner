import actionCreatorFactory, { Action, Success } from 'typescript-fsa';

import { NodesFocus } from 'modules/nodes';
import { NodeEntity } from 'services/models';

const actionCreator = actionCreatorFactory('NODES');

export interface DividedTitle {
  left: string;
  right: string;
}

interface RangeOffset {
  start: number;
  end: number;
}

export type FetchNodesAction = FluxStandardAction;
export const fetchNodes = actionCreator.async<
  FetchNodesAction['payload'],
  { list: NodeEntity[] },
  Error
>('FETCH');

export interface AddNodeAction extends FluxStandardAction {
  payload: {
    node: NodeEntity;
    dividedTitle: DividedTitle;
  };
}
export type AddNodeDoneAction = Action<
  Success<AddNodeAction['payload'], { list: NodeEntity[] }>
>;
export const addNode = actionCreator.async<
  AddNodeAction['payload'],
  { list: NodeEntity[] },
  Error
>('CREATE');

export interface EditNodeAction extends FluxStandardAction {
  payload: {
    node: NodeEntity;
    rangeOffset: RangeOffset;
  };
}
export type EditNodeDoneAction = Action<
  Success<EditNodeAction['payload'], { list: NodeEntity[] }>
>;
export const editNode = actionCreator.async<
  EditNodeAction['payload'],
  { list: NodeEntity[] },
  Error
>('UPDATE');

export interface DeleteNodeAction extends FluxStandardAction {
  payload: {
    node: NodeEntity;
    dividedTitle: DividedTitle;
  };
}
export type DeleteNodeDoneAction = Action<
  Success<DeleteNodeAction['payload'], { list: NodeEntity[] }>
>;
export const removeNode = actionCreator.async<
  DeleteNodeAction['payload'],
  { list: NodeEntity[] },
  Error
>('DELETE');

export const setFocus = actionCreator<{
  focus: NodesFocus;
}>('SET_FOCUS');

export interface UpdateGradeNodeAction extends FluxStandardAction {
  payload: {
    node: NodeEntity;
    rangeOffset: RangeOffset;
  };
}
export type UpdateGradeNodeDoneAction = Action<
  Success<UpdateGradeNodeAction['payload'], { list: NodeEntity[] }>
>;
export const promoteNode = actionCreator.async<
  UpdateGradeNodeAction['payload'],
  { list: NodeEntity[] },
  Error
>('PROMOTE_NODE');

export const relegateNode = actionCreator.async<
  UpdateGradeNodeAction['payload'],
  { list: NodeEntity[] },
  Error
>('RELEGATE_NODE');

export interface GoBackAction extends FluxStandardAction {
  payload: {
    node: NodeEntity;
  };
}
export const goBack = actionCreator<GoBackAction['payload']>('GO_BACK');

export interface GoForwardAction extends FluxStandardAction {
  payload: {
    node: NodeEntity;
  };
}
export const goForward = actionCreator<GoForwardAction['payload']>(
  'GO_FORWARD',
);
