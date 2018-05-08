import * as React from 'react';

import Item from 'components/Editor/Item';
import mockList from 'mock/list';

/**
 * 開閉
 *  ノードの子要素を非表示/表示切り替え
 */

const List = (id: number) => {
  const child: any = mockList.filter((el: any) => el.parent_id === id);
  if (child.length === 0) {
    return '';
  }

  return (
    <ul>
      {child.reduce(
        (c: any, e: any) => (
          <React.Fragment>
            {c} <li><Item title={e.title} /> {List(e.id)}</li>
          </React.Fragment>
        ),
        '',
      )}
    </ul>
  );
};

export default List;
