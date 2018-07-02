import * as React from 'react';

import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';

// import Item from '../src/components/Editor/Item';

const Item: React.SFC<any> = ({ node, onClick }) => (
  <div onClick={onClick}>{node.title}</div>
);

/* tslint:disable */
const data = {
  id: 1,
  title: 'title',
  order: 0,
  parent_id: 0,
  project_id: 1,
};

storiesOf('Welcome', module).add('to Storybook', () => <Item node={data} onClick={action("onClick")} />);
