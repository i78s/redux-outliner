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
  {},
  {},
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
