import * as React from 'react';
import { connect } from 'react-redux';
import { compose, lifecycle } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';

import { NodeEntity } from '~/models/node';
import { nodeActions } from '~/modules/nodes';
import { State } from '~/modules/store';

import List from '~/components/Node/List';

interface EnhancedProps {
  list: NodeEntity[];
  fetchList: () => void;
}

const mapStateToProps = (state: State) => ({
  list: state.nodes.list,
});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      fetchList: () => nodeActions.fetchNodes.started({}),
    },
    dispatch,
  );

export default compose<EnhancedProps, {}>(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  lifecycle<EnhancedProps, {}, {}>({
    componentDidMount() {
      this.props.fetchList();
    },
  }),
)(({ list }) => (
  <Container>
    <List list={list} />
  </Container>
));

const Container = styled.div`
  padding: 20px 20px 20px 0;
`;
