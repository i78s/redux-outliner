import Item from 'containers/Editor/Item';
import * as React from 'react';
import { compose } from 'recompose';
import styled from 'styled-components';

import { NodeEntity } from 'services/models';

export interface StateFromProps {
  list: NodeEntity[];
}
export interface DispatchFromProps {
  fetchList: () => void;
}
export type ListProps = StateFromProps & DispatchFromProps;

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

const enhance = compose<any, any>()(List);

export default enhance;

const Wrapper = styled.ul`
  margin-left: 20px;

  li {
    display: block;
  }
`;
