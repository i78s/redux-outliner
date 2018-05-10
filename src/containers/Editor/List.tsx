import { connect } from 'react-redux';
import { compose, lifecycle, pure } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';

import List, { ListProps } from 'components/Editor/List';
import { fetchNodes } from 'modules/nodes';
import { State } from 'modules/store';

const mapStateToProps = (state: State) => ({
  nodes: state.nodes,
});

const mapDispatchToProps = (dispatch: Dispatch<State>) => (
  bindActionCreators(
    { fetch: () => fetchNodes.started({}) },
    dispatch,
  )
);

export default compose<ListProps, any>(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  lifecycle<ListProps, {}, {}>({
    componentDidMount() {
      this.props.fetch();
    },
  }),
  pure,
)(List);
