import * as React from 'react';

import mockList from 'mock/list';

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
            {c} <li>{e.title} {List(e.id)}</li>
          </React.Fragment>
        ),
        '',
      )}
    </ul>
  );
};

export default List;
