import * as React from 'react';
import { pure } from 'recompose';
import styled from 'styled-components';

import { NodeEntity } from '~/models/node';

import Editor from '~/components/Node/Item/Editor';

interface OuterProps {
  node: NodeEntity;
}

const Item: React.SFC<OuterProps> = ({ node }) => (
  <Node>
    <Dot />
    <Editor node={node} />
  </Node>
);

export default pure(Item);

const Node = styled.div`
  position: relative;
`;

const Dot = styled.div`
  position: absolute;
  top: 8px;
  left: 0;
  width: 7px;
  height: 7px;
  background-color: #333;
  border-radius: 50%;
`;
