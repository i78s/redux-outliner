import { connect } from 'react-redux';
import { compose, lifecycle, withHandlers } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';

import List, { DispatchFromProps } from 'components/Editor/List';
import {
  addNode,
  fetchNodes,
} from 'modules/nodes';
import { State } from 'modules/store';

const mapStateToProps = (state: State) => ({
  list: state.nodes.list,
});

const mapDispatchToProps = (dispatch: Dispatch<State>) => (
  bindActionCreators(
    {
      fetchList: () => fetchNodes.started({}),
      addNode: () => addNode.started({}),
    },
    dispatch,
  )
);

export default compose<DispatchFromProps, any>(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  lifecycle<DispatchFromProps, {}, {}>({
    componentDidMount() {
      this.props.fetchList();
    },
  }),
  withHandlers<DispatchFromProps, {}>({
    addNode: (props) => () => {
      // tslint:disable-next-line:no-console
      console.log(props);
      props.addNode();
    },
  }),
)(List);
