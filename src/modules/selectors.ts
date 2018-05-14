import { State } from 'modules/store';
import { select, SelectEffect } from 'redux-saga/effects';

export function selectState<T>(selector: (s: State) => T): SelectEffect {
  return select(selector);
}

export const getNodesList = (state: State) => state.nodes.list;
