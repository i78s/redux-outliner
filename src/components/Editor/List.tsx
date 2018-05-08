import Item from 'components/Editor/Item';
import * as React from 'react';
import { compose, lifecycle, withStateHandlers } from 'recompose';

import { NodeEntity } from 'services/models';
import nodes from 'services/nodes';

// interface ListProps {
//   title: string;
// }

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

  if (props.data.length === 0) {
    return <div />;
  }

  return RecursionList(props.data);
};

const enhance = compose<any, any>(
  withStateHandlers({ data: [] }, {
    onData: state => (data) => ({
      data,
    }),
  }),
  lifecycle<any, {}, {}>({
    componentDidMount() {
      nodes.getList()
        .then(res => {
          this.props.onData(res);
        });
    },
  }),
)(List);

export default enhance;
