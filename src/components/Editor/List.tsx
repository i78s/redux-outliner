import Item from 'components/Editor/Item';
import * as React from 'react';
import { compose } from 'recompose';

import { NodeEntity } from 'services/models';

export interface ListProps {
  nodes: NodeEntity;
  fetch: () => void;
}

/**
 * 開閉
 *  ノードの子要素を非表示/表示切り替え
 */

const RecursionList = (list: NodeEntity[], id = 0) => {
  const child: any = list.filter((el) => el.parent_id === id);
  if (child.length === 0) {
    return <React.Fragment />;
  }

  return (
    <ul>
      {child.reduce(
        (c: any, e: any) => (
          <React.Fragment>
            {c} <li><Item title={e.title} /> {RecursionList(list, e.id)}</li>
          </React.Fragment>
        ),
        '',
      )}
    </ul>
  );
};

const List = (props: any) => {

  if (props.nodes.list.length === 0) {
    return <div />;
  }

  return RecursionList(props.nodes.list);
};

const enhance = compose<any, any>()(List);

export default enhance;
