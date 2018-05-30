import Item from 'containers/Editor/Item';
import * as React from 'react';
import styled from 'styled-components';

import { NodeEntity } from 'services/models';

export interface Props {
  list: NodeEntity[];
}
export interface DispatchFromProps {
  fetchList: () => void;
}
export type ListProps = Props & DispatchFromProps;

/**
 * 開閉
 *  ノードの子要素を非表示/表示切り替え
 */

const RecursionList = (list: NodeEntity[], id = 0) => {
  const child: any = list
    .filter((el) => el.parent_id === id)
    .sort((a, b) => {
      return a.order - b.order;
    });

  if (child.length === 0) {
    return <React.Fragment />;
  }

  return (
    <Wrapper>
      {child.reduce(
        (c: any, e: any) => (
          <React.Fragment>
            {c} <li><Item key={e.id} node={e} /> {RecursionList(list, e.id)}</li>
          </React.Fragment>
        ),
        '',
      )}
    </Wrapper>
  );
};

const List: React.SFC<ListProps> = (props) => {

  if (props.list.length === 0) {
    return <div />;
  }

  return RecursionList(props.list);
};

export default List;

const Wrapper = styled.ul`
  margin-left: 20px;
  li {
    display: block;
  }
`;
