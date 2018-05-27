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
export const findNodeToBeFocusedAfterDelete = (list: NodeEntity[], target: NodeEntity): NodeEntity | null => {
  let node: NodeEntity | null = null;

  const others = list.filter(el => el.id !== target.id);
  const parent = others.filter(el => el.id === target.parent_id)[0];
  const sibling = others
    .filter(el => el.parent_id === target.parent_id)
    .sort((a, b) => a.order - b.order);

  if (parent) {
    node = { ...parent };
  }

  const index = target.order;
  if (sibling.length !== 0 && index !== 0) {
    const elder = sibling[index - 1];
    node = { ...elder };

    let child = others
      .filter(el => el.parent_id === elder.id)
      .sort((a, b) => a.order - b.order);
    while (child.length !== 0) {
      const last = child[child.length - 1];
      child = others
        .filter(el => el.parent_id === last.id)
        .sort((a, b) => a.order - b.order);
      node = { ...last };
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
