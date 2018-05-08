import * as React from 'react';

const mockList = [
  {
    id: 1,
    title: 'hoge',
    parent_id: 0,
  },
  {
    id: 2,
    title: 'foo',
    parent_id: 1,
  },
  {
    id: 3,
    title: 'bar',
    parent_id: 2,
  },
];

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

export default () => {
  return (
    <div>
      {List(0)}
    </div>
  );
};
