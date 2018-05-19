import { State } from 'modules/store';
import { select, SelectEffect } from 'redux-saga/effects';
import { NodeEntity } from 'services/models';

export function selectState<T>(selector: (s: State) => T): SelectEffect {
  return select(selector);
}

export const getNodesList = (state: State) => state.nodes.list;

export const findFocusIdAfterDelete = (state: State, target: NodeEntity): number => {
  /**
   * 削除されたnodeに
   *  兄弟がいない
   *    親がいる => 親のid
   *    親がいない => 削除できない
   *  兄弟がいる
   *    自身が兄弟の先頭 => 親のid
   *    自身が兄弟の先頭じゃない
   *      前にいる兄弟に子がいる => 自身の手前にいる兄弟のid
   *      前にいる兄弟に子がいない => 前にいる兄弟の末尾の子のid
   */
  let focusId = 0;

  const tmp = getNodesList(state);
  const list = tmp.filter(el => el.id !== target.id);

  const parent = list.filter(el => el.id === target.parent_id)[0];
  const sibling = list
    .filter(el => el.parent_id === target.parent_id)
    .sort((a, b) => a.order - b.order);

  if (sibling.length === 0) {

    if (parent) {
      focusId = parent.id || 0;
    }

  } else {
    const index = tmp
      .filter(el => el.parent_id === target.parent_id)
      .sort((a, b) => a.order - b.order)
      .findIndex(el => el.id === target.id);

    focusId = parent.id || 0;
    if (index !== 0) {
      focusId = sibling[index - 1].id || 0;
    }
  }

  return focusId;
};
