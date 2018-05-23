import {
  getNodesList,
} from 'modules/selectors';

describe('getNodesList', () => {
  it('initial', () => {
    const patterns = [
      {
        args: [],
      },
      {
        args: [
          {
            id: 1,
            title: 'hoge',
            order: 0,
            parent_id: 0,
            project_id: 1,
          },
        ],
      },
    ];

    for (let i = 0, len = patterns.length; i < len; i++) {
      const list = getNodesList({
        nodes: {
          focus: {
            id: 0,
            start: 0,
            end: 0,
          },
          list: patterns[i].args,
        },
      });
      expect(list).toEqual(patterns[i].args);
    }
  });
});
