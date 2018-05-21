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
    const target = list[0];

    const id = findFocusIdAfterDelete(list, target);
    expect(id).toBe(0);
  });

  describe('兄弟がいない', () => {
    describe('親が', () => {
      const list = [
        {
          id: 1,
          title: 'hoge',
          order: 0,
          parent_id: 0,
          project_id: 1,
        },
        {
          id: 2,
          title: 'foo',
          order: 0,
          parent_id: 1,
          project_id: 1,
        },
      ];

      /*
      - 1: hoge
        - 2: foo
      */
      it('いる', () => {
        const target = list[1];
        const id = findFocusIdAfterDelete(list, target);
        expect(id).toBe(1);
      });

      it('いない', () => {
        const target = list[0];
        const id = findFocusIdAfterDelete(list, target);
        expect(id).toBe(0);
      });
    });
  });

  describe('兄弟がいる', () => {
    const list = [
      {
        id: 1,
        title: 'hoge',
        order: 0,
        parent_id: 0,
        project_id: 1,
      },
      {
        id: 2,
        title: 'foo',
        order: 1,
        parent_id: 0,
        project_id: 1,
      },
      {
        id: 3,
        title: 'bar',
        order: 0,
        parent_id: 2,
        project_id: 1,
      },
      {
        id: 4,
        title: 'baz',
        order: 1,
        parent_id: 2,
        project_id: 1,
      },
      {
        id: 5,
        title: 'boo',
        order: 2,
        parent_id: 0,
        project_id: 1,
      },
    ];

    /*
    - 1: hoge
    - 2: foo
      - 3: foo
      - 4: baz
    - 5: boo
    */
    describe('自身が兄弟の先頭じゃない', () => {
      it('前の兄弟に子がいない', () => {
        const target = list[3];
        const id = findFocusIdAfterDelete(list, target);
        expect(id).toBe(3);
      });

      // todo 未実装
      it('前の兄弟に子がいる', () => {
        const target = list[4];
        const id = findFocusIdAfterDelete(list, target);
        expect(id).toBe(4);
      });
    });

    describe('自身が兄弟の先頭', () => {
      it('親がいる', () => {
        const target = list[2];
        const id = findFocusIdAfterDelete(list, target);
        expect(id).toBe(2);
      });
      it('親がいない', () => {
        const target = list[0];
        const id = findFocusIdAfterDelete(list, target);
        expect(id).toBe(0);
      });
    });
  });
});
