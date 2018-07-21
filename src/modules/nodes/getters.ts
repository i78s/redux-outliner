import { DividedTitle } from '~/modules/nodes/actions';
import { CreateNodeParams, NodeEntity } from '~/services/models';

interface NodesAndDiffs {
  list: NodeEntity[];
  diff: NodeEntity[];
}

interface NodesAndReq<T> {
  list: NodeEntity[];
  req: T;
}

export const getNodesAndReqParamBeforeCreate = (
  list: NodeEntity[],
  node: NodeEntity,
  title: DividedTitle,
): NodesAndReq<CreateNodeParams> => {
  const child = list.filter(el => el.parent_id === node.id);
  const isCreateChild = child.length !== 0;
  const parentID = !isCreateChild ? node.parent_id : node.id;
  const order = !isCreateChild ? node.order + 1 : 0;

  const result = [];
  for (let i = 0, len = list.length; i < len; i++) {
    let el = list[i];
    if (el.id === node.id) {
      // Enterキーの起点のnodeを更新
      el = {
        ...el,
        title: title.left,
      };
    } else if (
      // 新規作成されたnodeの後ろにあるnodeの順番を更新
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
      title: title.right,
      order,
      parent_id: parentID,
    },
  };
};
export const getNodesAndReqParamBeforeDelete = (
  list: NodeEntity[],
  target: NodeEntity,
  beFocused: NodeEntity,
  rightEnd: string,
): NodesAndReq<NodeEntity | null> => {
  const others = list.filter(el => el.id !== target.id);
  const result = [];
  let req: NodeEntity | null = null;
  for (let i = 0, len = others.length; i < len; i++) {
    let el = others[i];
    // delキー押下時にキャレットの右側に文字があればフォーカス移動先のnodeに引き継ぐ
    if (rightEnd && el.id === beFocused.id) {
      el = {
        ...el,
        title: el.title + rightEnd,
      };
      req = el;
    } else if (
      // 削除されるnodeの弟がいればorderを前につめる
      el.parent_id === target.parent_id &&
      el.order > target.order
    ) {
      el = {
        ...el,
        order: el.order - 1,
      };
      // 削除されるnodeに子がいる場合は引き継ぐ
    } else if (el.parent_id === target.id) {
      el = {
        ...el,
        parent_id: beFocused.id,
      };
    }
    result[i] = el;
  }

  return {
    list: result,
    req,
  };
};
// node削除後の次のフォーカスをあてるnodeを返す
export const findNodeToBeFocusedAfterDelete = (
  list: NodeEntity[],
  target: NodeEntity,
): NodeEntity | null => {
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
  // 兄弟がいない or 自身が兄弟の先頭の時は親が返る
  if (sibling.length !== 0 && index !== 0) {
    const elder = sibling[index - 1];
    node = { ...elder };

    const cousin = others.filter(el => el.parent_id === elder.id);
    if (cousin.length !== 0) {
      // 兄に子がいる時は削除させない
      node = null;
    }
  }

  return node;
};
// 左or上矢印押下後フォーカスの移動先になるnodeを返す
export const findNodeOnBack = (
  list: NodeEntity[],
  target: NodeEntity,
): NodeEntity | null => {
  const others = list.filter(el => el.id !== target.id);
  const parent = others.filter(el => el.id === target.parent_id)[0];
  const sibling = others
    .filter(el => el.parent_id === target.parent_id)
    .sort((a, b) => a.order - b.order);

  let node: NodeEntity | null = null;

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
// 右or下矢印押下後フォーカスの移動先になるnodeを返す
export const findNodeOnForward = (
  list: NodeEntity[],
  target: NodeEntity,
): NodeEntity | null => {
  const child = list.filter(el => el.parent_id === target.id);
  const sibling = list
    .filter(el => el.parent_id === target.parent_id)
    .sort((a, b) => a.order - b.order);
  const younger = sibling[target.order + 1];

  let parent = list.find(el => el.id === target.parent_id);
  let node: NodeEntity | null = null;

  if (child.length !== 0) {
    node = { ...child[0] };
  } else if (younger) {
    node = { ...younger };
  } else if (parent) {
    // 親を辿って弟を持つnodeがいるか走査
    while (parent) {
      const y = list.filter(
        el =>
          el.parent_id === parent!.parent_id && el.order === parent!.order + 1,
      )[0];
      if (y) {
        node = { ...y };
        break;
      }
      parent = list.find(el => el.id === parent!.parent_id)!;
    }
  }

  return node;
};
// 該当nodeの階層を一段上げた後のnode一覧を返す
export const getNodesAndDiffsAfterPromoted = (
  list: NodeEntity[],
  target: NodeEntity,
): NodesAndDiffs => {
  // すでに一番上の階層なら変更不可
  if (target.parent_id === 0) {
    return {
      list,
      diff: [],
    };
  }

  const parent = list.find(el => el.id === target.parent_id)!;
  const child = list.filter(el => el.parent_id === target.id);

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
    } else if (
      // // 割り込んだので後ろにいた旧親のorderをずらす
      el.parent_id === parent.parent_id &&
      el.order > parent.order
    ) {
      el = {
        ...el,
        order: el.order + 1,
      };
      diff.push(el);
    } else if (
      // 自身より後ろにいる兄弟を自分の子にする
      el.parent_id === target.parent_id &&
      el.order > target.order
    ) {
      el = {
        ...el,
        // orderを自分の子に連結した形にする
        order: el.order + child.length - 1,
        parent_id: target.id,
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
export const getNodesAndDiffsAfterRelegate = (
  list: NodeEntity[],
  target: NodeEntity,
): NodesAndDiffs => {
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
        parent_id: elder.id,
      };
      diff.push(el);
    }
    if (
      // 弟がいる時
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
