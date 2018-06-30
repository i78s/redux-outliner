import List, { ListProps } from 'components/Editor/List';
import {
  fetchNodes,
} from 'modules/nodes/actions';
import { State } from 'modules/store';
import { connect } from 'react-redux';
import { compose, lifecycle } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';

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

export default compose<ListProps, {}>(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  lifecycle<ListProps, {}, {}>({
    componentDidMount() {
      this.props.fetchList();
    },
  }),
)(List);
