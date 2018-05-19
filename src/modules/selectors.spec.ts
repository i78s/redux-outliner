import {
  findFocusIdAfterDelete,
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
          list: patterns[i].args,
        },
      });
      expect(list).toEqual(patterns[i].args);
    }
  });
});

describe('findFocusIdAfterDelete', () => {
  it('nodeが最後の1つで削除できない', () => {
    const list = [
      {
        id: 1,
        title: 'hoge',
        order: 0,
        parent_id: 0,
        project_id: 1,
      },
    ];
    const state = {
      nodes: {
        list,
      },
    };
    const target = list[0];

    const id = findFocusIdAfterDelete(state, target);
    expect(id).toBe(0);
  });
});
