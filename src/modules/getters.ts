import { NodeEntity } from 'services/models';

interface NodesAndDiffs {
  list: NodeEntity[];
  diff: NodeEntity[];
}

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
  // すでに一番上の階層なら変更不可
  if (target.parent_id === 0) {
    return list;
  }

  const parent = list.find(el => el.id === target.parent_id)!;
  const child = list
    .filter(el => el.parent_id === target.id);

  return list
    .map(el => {
      // 自身は親のindexの次に割り込み
      if (el.id === target.id) {
        return {
          ...el,
          order: parent.order + 1,
          parent_id: parent.parent_id,
        };
      }
      // 割り込んだので後ろにいた旧親のorderをずらす
      if (
        el.parent_id === parent.parent_id &&
        el.order > parent.order
      ) {
        return {
          ...el,
          order: el.order + 1,
        };
      }
      // 自身より後ろにいる兄弟を自分の子にする
      if (
        el.parent_id === target.parent_id &&
        el.order > target.order
      ) {
        return {
          ...el,
          // orderを自分の子に連結した形にする
          order: el.order + child.length - 1,
          parent_id: target.id!,
        };
      }

      return el;
    });
};
// 該当nodeの階層を一段下げた後のnode一覧を返す
export const getNodesAndDiffsAfterRelegate = (list: NodeEntity[], target: NodeEntity): NodesAndDiffs => {
  // 一番先頭のnodeは変更できない
  if (target.order === 0) {
    return {
      list,
      diff: [],
    };
  }
  const sibling = list
    .filter(el => el.parent_id === target.parent_id)
    .sort((a, b) => a.order - b.order);
  const elder = sibling[target.order - 1];
  const cousin = list.filter(el => el.parent_id === elder.id);

  const result = [];
  const diff = [];
  for (let i = 0, len = list.length; i < len; i++) {
    let el = list[i];
    if (el.id === target.id) {
      el = {
        ...el,
        order: cousin.length,
        parent_id: elder.id!,
      };
      diff.push(el);
    }
    if (  // 弟がいる時
      el.parent_id === target.parent_id &&
      el.order > target.order
    ) {
      el = {
        ...el,
        order: el.order - 1,
      };
      diff.push(el);
    }
    result[i] = el;
  }

  return {
    list: result,
    diff,
  };
};
