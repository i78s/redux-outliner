import { connect } from 'react-redux';
import { compose, lifecycle } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';

import List, { DispatchFromProps } from 'components/Editor/List';
import {
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
)(List);
