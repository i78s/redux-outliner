import { NodesFocus } from 'modules/nodes';
import { NodeEntity } from 'services/models';
import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory('NODES');

export const fetchNodes = actionCreator.async<
  {},
  { list: NodeEntity[] },
  Error
>('FETCH');

export const addNode = actionCreator.async<
  { before?: string; after?: string; node?: NodeEntity },
  { list: NodeEntity[] },
  Error
>('CREATE');

export const editNode = actionCreator.async<
  { node?: NodeEntity, start?: number, end?: number },
  { list: NodeEntity[] },
  Error
>('UPDATE');

export const removeNode = actionCreator.async<
  { before?: string; after?: string; node?: NodeEntity },
  { list: NodeEntity[] },
  Error
>('DELETE');

export const setFocus = actionCreator<{
  focus: NodesFocus,
}>('SET_FOCUS');

export const promoteNode = actionCreator.async<
  { node?: NodeEntity, start?: number, end?: number },
  { list: NodeEntity[] },
  Error
>('PROMOTE_NODE');

export const relegateNode = actionCreator.async<
  { node?: NodeEntity, start?: number, end?: number },
  { list: NodeEntity[] },
  Error
>('RELEGATE_NODE');

export const goBack = actionCreator<{
  node?: NodeEntity;
}>('GO_BACK');

export const goForward = actionCreator<{
  node?: NodeEntity;
}>('GO_FORWARD');
