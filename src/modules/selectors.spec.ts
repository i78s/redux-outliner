import { getNodesList } from 'modules/selectors';

describe('getNodesList', () => {
  it('initial', () => {
    const list = getNodesList({
      nodes: {
        list: [],
      },
    });
    expect(list).toEqual([]);
  });
});
