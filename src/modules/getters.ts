import { NodeEntity } from 'services/models';

// node削除後の次のフォーカスをあてるnodeを返す
export const findFocusNodeAfterDelete = (list: NodeEntity[], target: NodeEntity): NodeEntity | null => {
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
  let node: NodeEntity | null = null;

  const others = list.filter(el => el.id !== target.id);
  const parent = others.filter(el => el.id === target.parent_id)[0];
  const sibling = others
    .filter(el => el.parent_id === target.parent_id)
    .sort((a, b) => a.order - b.order);

  if (sibling.length === 0) {

    if (parent) {
      node = { ...parent };
    }

  } else {

    // todo バックエンドで削除後にorderの更新しないと不整合が起きる
    // const index = target.order;
    const index = list
      .filter(el => el.parent_id === target.parent_id)
      .sort((a, b) => a.order - b.order)
      .findIndex(el => el.id === target.id);
    if (index !== 0) {
      const elder = sibling[index - 1];
      const cousin = others
        .filter(el => el.parent_id === elder.id)
        .sort((a, b) => a.order - b.order);

      node = { ...elder };

      if (cousin.length !== 0) {
        node = { ...cousin[cousin.length - 1] };
      }
    } else {
      if (parent) {
        node = { ...parent };
      }
    }
  }

  return node;
};
// 該当nodeの階層を一段上げた後のnode一覧を返す
export const getNodesAfterPromotedNode = (list: NodeEntity[], target: NodeEntity): NodeEntity[] => {
  return list;
};
// 該当nodeの階層を一段下げた後のnode一覧を返す
export const getNodesAfterRelegateNode = (list: NodeEntity[], target: NodeEntity): NodeEntity[] => {
  /**
   * todo
   * 兄に子が いる / いない
   */
  // 一番先頭のnodeは変更できない
  if (target.order === 0) {
    return list;
  }

  return list;
};
