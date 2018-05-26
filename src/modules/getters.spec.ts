import {
  findFocusNodeAfterDelete,
  getNodesAndDiffsAfterPromoted,
  getNodesAndDiffsAfterRelegate,
} from 'modules/getters';

describe('findFocusNodeAfterDelete', () => {
  it('nodeが最後の1つの時はnullを返すこと', () => {
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

    const node = findFocusNodeAfterDelete(list, target);
    expect(node).toBe(null);
  });

  describe('兄弟がいない', () => {
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
    describe('親がいる', () => {
      it('親を返すこと', () => {
        const target = list[1];
        const node = findFocusNodeAfterDelete(list, target);
        expect(node).toEqual(list[0]);
      });
    });
    describe('いない', () => {
      it('nullを返すこと', () => {
        const target = list[0];
        const node = findFocusNodeAfterDelete(list, target);
        expect(node).toBe(null);
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
      - 3: bar
      - 4: baz
    - 5: boo
    */
    describe('自身が兄弟の先頭じゃない', () => {
      describe('前の兄弟に子がいない', () => {
        it('兄を返すこと', () => {
        const target = list[3];
        const node = findFocusNodeAfterDelete(list, target);
        expect(node).toEqual(list[2]);
      });
      });
      describe('前の兄弟に子がいる', () => {
        it('前の兄弟の末っ子を返すこと', () => {
        const target = list[4];
        const node = findFocusNodeAfterDelete(list, target);
        expect(node).toEqual(list[3]);
      });
    });
    });

    describe('自身が兄弟の先頭で', () => {
      describe('親がいる', () => {
        it('親を返すこと', () => {
        const target = list[2];
        const node = findFocusNodeAfterDelete(list, target);
        expect(node).toEqual(list[1]);
      });
      });
      describe('親がいない', () => {
        it('0を返すこと', () => {
        const target = list[0];
        const node = findFocusNodeAfterDelete(list, target);
        expect(node).toBe(null);
      });
    });
  });
});
});

describe('getNodesAndDiffsAfterRelegate', () => {
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
    - 3: bar
    - 4: baz
  - 5: boo
  */
  it('一番先頭の(兄がいない)nodeは変更できない', () => {
    const targets = [0, 2];

    targets.forEach(el => {
      const result = getNodesAndDiffsAfterRelegate(list, list[el]);
      expect(result).toEqual({
        list,
        diff: [],
      });
    });
  });

  describe('兄に子が', () => {
    it('いる', () => {
      const result = getNodesAndDiffsAfterRelegate(list, list[4]);
      expect(result).toEqual({
        list: [
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
            parent_id: 2,
            project_id: 1,
          },
        ],
        diff: [
          {
            id: 5,
            title: 'boo',
            order: 2,
            parent_id: 2,
            project_id: 1,
          },
        ],
      });
    });
    it('いない', () => {
      const result = getNodesAndDiffsAfterRelegate(list, list[1]);
      expect(result).toEqual({
        list: [
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
            order: 1,
            parent_id: 0,
            project_id: 1,
          },
        ],
        diff: [
          {
            id: 2,
            title: 'foo',
            order: 0,
            parent_id: 1,
            project_id: 1,
          },
          {
            id: 5,
            title: 'boo',
            order: 1,
            parent_id: 0,
            project_id: 1,
          },
        ],
      });
    });
  });
});

describe('getNodesAndDiffsAfterPromoted', () => {
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
      order: 0,
      parent_id: 3,
      project_id: 1,
    },
    {
      id: 5,
      title: 'boo',
      order: 1,
      parent_id: 3,
      project_id: 1,
    },
    {
      id: 6,
      title: 'hoo',
      order: 1,
      parent_id: 2,
      project_id: 1,
    },
    {
      id: 7,
      title: 'xoxo',
      order: 2,
      parent_id: 0,
      project_id: 1,
    },
  ];

  /*
  - 1: hoge
  - 2: foo
    - 3: bar
      - 4: baz
      - 5: boo
    - 6: hoo
  - 7: xoxo
  */
  it('一番上のnodeの階層を上げることはできない', () => {
    const targets = [0, 1, 6];
    targets.forEach(el => {
      const result = getNodesAndDiffsAfterPromoted(list, list[el]);
      expect(result).toEqual({
        list,
        diff: [],
      });
    });
  });

  describe('自身に親がいて', () => {
    describe('自身に子がいて弟がいる', () => {
      it('子はそのまま自身の階層が上がり、弟のorderと親の弟のorderが変更されること', () => {
      const result = getNodesAndDiffsAfterPromoted(list, list[2]);
      /*
      - 1: hoge
      - 2: foo
      - 3: bar
        - 4: baz
        - 5: boo
        - 6: hoo
      - 7: xoxo
      */
      expect(result).toEqual({
        list: [
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
            order: 2,
            parent_id: 0,
            project_id: 1,
          },
          {
            id: 4,
            title: 'baz',
            order: 0,
            parent_id: 3,
            project_id: 1,
          },
          {
            id: 5,
            title: 'boo',
            order: 1,
            parent_id: 3,
            project_id: 1,
          },
          {
            id: 6,
            title: 'hoo',
            order: 2,
            parent_id: 3,
            project_id: 1,
          },
          {
            id: 7,
            title: 'xoxo',
            order: 3,
            parent_id: 0,
            project_id: 1,
          },
        ],
        diff: [
          {
            id: 3,
            title: 'bar',
            order: 2,
            parent_id: 0,
            project_id: 1,
          },
          {
            id: 6,
            title: 'hoo',
            order: 2,
            parent_id: 3,
            project_id: 1,
          },
          {
            id: 7,
            title: 'xoxo',
            order: 3,
            parent_id: 0,
            project_id: 1,
          },
        ],
      });
    });
    });
    describe('自身に子がいなくて弟がいる', () => {
      it('自身の階層が上がり弟が新しく子になり、親の弟のorderが変更されること', () => {
      const result = getNodesAndDiffsAfterPromoted(list, list[3]);
      /*
      - 1: hoge
      - 2: foo
        - 3: bar
        - 4: baz
          - 5: boo
        - 6: hoo
      - 7: xoxo
      */
      expect(result).toEqual({
        list: [
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
            order: 0,
            parent_id: 4,
            project_id: 1,
          },
          {
            id: 6,
            title: 'hoo',
            order: 2,
            parent_id: 2,
            project_id: 1,
          },
          {
            id: 7,
            title: 'xoxo',
            order: 2,
            parent_id: 0,
            project_id: 1,
          },
        ],
        diff: [
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
            order: 0,
            parent_id: 4,
            project_id: 1,
          },
          {
            id: 6,
            title: 'hoo',
            order: 2,
            parent_id: 2,
            project_id: 1,
          },
        ],
      });
    });
    });
    describe('自身に子がいなくて弟もいない', () => {
      it('自身の階層が上がり、親の弟のorderが変更されること', () => {
      const result = getNodesAndDiffsAfterPromoted(list, list[4]);
      /*
      - 1: hoge
      - 2: foo
        - 3: bar
          - 4: baz
        - 5: boo
        - 6: hoo
      - 7: xoxo
      */
      expect(result).toEqual({
        list: [
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
            order: 0,
            parent_id: 3,
            project_id: 1,
          },
          {
            id: 5,
            title: 'boo',
            order: 1,
            parent_id: 2,
            project_id: 1,
          },
          {
            id: 6,
            title: 'hoo',
            order: 2,
            parent_id: 2,
            project_id: 1,
          },
          {
            id: 7,
            title: 'xoxo',
            order: 2,
            parent_id: 0,
            project_id: 1,
          },
        ],
        diff: [
          {
            id: 5,
            title: 'boo',
            order: 1,
            parent_id: 2,
            project_id: 1,
          },
          {
            id: 6,
            title: 'hoo',
            order: 2,
            parent_id: 2,
            project_id: 1,
          },
        ],
      });
    });
      it('自身の階層が上がり、親の弟のorderが変更されること part 2', () => {
      /*
      - 1: hoge
      - 2: foo
        - 3: bar
          - 4: baz
          - 5: boo
      - 6: hoo
      - 7: xoxo
      */
      const result = getNodesAndDiffsAfterPromoted(list, list[5]);
      expect(result).toEqual({
        list: [
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
            order: 0,
            parent_id: 3,
            project_id: 1,
          },
          {
            id: 5,
            title: 'boo',
            order: 1,
            parent_id: 3,
            project_id: 1,
          },
          {
            id: 6,
            title: 'hoo',
            order: 2,
            parent_id: 0,
            project_id: 1,
          },
          {
            id: 7,
            title: 'xoxo',
            order: 3,
            parent_id: 0,
            project_id: 1,
          },
        ],
        diff: [
          {
            id: 6,
            title: 'hoo',
            order: 2,
            parent_id: 0,
            project_id: 1,
          },
          {
            id: 7,
            title: 'xoxo',
            order: 3,
            parent_id: 0,
            project_id: 1,
          },
        ],
      });
    });
  });
});
});
