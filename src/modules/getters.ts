import { NodeEntity } from 'services/models';

interface NodesAndDiffs {
  list: NodeEntity[];
  diff: NodeEntity[];
}

interface NodesAndReq {
  list: NodeEntity[];
  req: NodeEntity;
}

export const getNodesAndReqParamBeforeCreate = (list: NodeEntity[], payload: any): NodesAndReq => {
  const { after, before, node } = payload;
  const child = list.filter(el => el.parent_id === node.id);
  const isCreateChild = child.length !== 0;
  const parentID = !isCreateChild ? node.parent_id : node.id;
  const order = !isCreateChild ? node.order + 1 : 0;

  const result = [];
  for (let i = 0, len = list.length; i < len; i++) {
    let el = list[i];
    if (el.id === node.id) {  // Enterキーの起点のnodeを更新
      el = {
        ...el,
        title: before,
      };
    } else if ( // 新規作成されたnodeの後ろにあるnodeの順番を更新
      el.parent_id === parentID &&
      order <= el.order
    ) {
      el = { ...el, order: el.order + 1 };
    }
    result[i] = el;
  }

  return {
    list: result,
    req: {
      ...node,
      id: null,
      title: after,
      order,
      parent_id: parentID,
    },
  };
};
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
export const getNodesAndDiffsAfterPromoted = (list: NodeEntity[], target: NodeEntity): NodesAndDiffs => {
  // すでに一番上の階層なら変更不可
  if (target.parent_id === 0) {
    return {
      list,
      diff: [],
    };
  }

  const parent = list.find(el => el.id === target.parent_id)!;
  const child = list
    .filter(el => el.parent_id === target.id);

  const result = [];
  const diff = [];
  for (let i = 0, len = list.length; i < len; i++) {
    let el = list[i];
    // 自身は親のindexの次に割り込み
    if (el.id === target.id) {
      el = {
        ...el,
        order: parent.order + 1,
        parent_id: parent.parent_id,
      };
      diff.push(el);
    } else if (  // // 割り込んだので後ろにいた旧親のorderをずらす
      el.parent_id === parent.parent_id &&
      el.order > parent.order
    ) {
      el = {
        ...el,
        order: el.order + 1,
      };
      diff.push(el);
    } else if (  // 自身より後ろにいる兄弟を自分の子にする
      el.parent_id === target.parent_id &&
      el.order > target.order
    ) {
      el = {
        ...el,
        // orderを自分の子に連結した形にする
        order: el.order + child.length - 1,
        parent_id: target.id!,
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
