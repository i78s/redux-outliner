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

// tslint:disable-next-line:max-line-length
// https://ja.stackoverflow.com/questions/7341/php%E5%A4%9A%E6%AC%A1%E5%85%83%E9%85%8D%E5%88%97%E3%81%8B%E3%82%89%E9%9A%8E%E5%B1%A4%E3%83%AA%E3%82%B9%E3%83%88%E3%82%BF%E3%82%B0ulli-liliulli-li-ul-li-ul%E3%82%92%E5%87%BA%E5%8A%9B%E3%81%97%E3%81%9F%E3%81%84/7370#7370
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
