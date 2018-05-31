import { withInfo } from '@storybook/addon-info';
import { storiesOf } from '@storybook/react';
import * as React from 'react';

const Example = () => <div>example</div>;

storiesOf('Example', module)
  .add(
    'Example',
    withInfo(
      'Example',
    )(
      () => <Example />,
    ),
  );
