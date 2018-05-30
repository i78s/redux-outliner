import * as React from 'react';
import styled from 'styled-components';

import List from 'containers/Editor/List';

export default () => {
  return (
    <Container>
      <List />
    </Container>
  );
};

const Container = styled.div`
  padding: 20px 20px 20px 0;
`;
