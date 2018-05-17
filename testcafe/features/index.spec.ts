import { Selector } from 'testcafe';
import config from '../testcafe.config';
import { dt } from '../utils';

fixture('Top page')
  .page(`${config.baseUrl}/`);

test('Is there the App logo?', async t => {
  await t
    .expect(Selector(dt('app-logo')).exists).ok();
});
