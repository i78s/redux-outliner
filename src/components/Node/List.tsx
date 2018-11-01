import * as React from 'react';
import styled from 'styled-components';

import Item from '~/components/Node/Item';
import { NodeEntity } from '~/models/node';

interface OuterProps {
  list: NodeEntity[];
}

type EnhancedProps = OuterProps;

/**
 * 開閉
 *  ノードの子要素を非表示/表示切り替え
 */
const List: React.SFC<EnhancedProps> = props => {
  if (props.list.length === 0) {
    return <div />;
  }

  return RecursionList(props.list);
};

const RecursionList = (list: NodeEntity[], id = 0) => {
  const child = list.filter(el => el.parent_id === id).sort((a, b) => {
    return a.order - b.order;
  });

  if (child.length === 0) {
    return <React.Fragment />;
  }

  return (
    <Wrapper>
      {child.reduce(
        (c: any, e) => (
          <React.Fragment>
            {c}{' '}
            <li>
              <Item key={e.id} node={e} /> {RecursionList(list, e.id)}
            </li>
          </React.Fragment>
        ),
        '',
      )}
    </Wrapper>
  );
};

export default List;

const Wrapper = styled.ul`
  margin-left: 20px;
  li {
    display: block;
  }
`;
