import {
  findNodeOnBack,
  findNodeToBeFocusedAfterDelete,
  getNodesAndDiffsAfterPromoted,
  getNodesAndDiffsAfterRelegate,
  getNodesAndReqParamBeforeCreate,
} from 'modules/getters';

describe('getNodesAndReqParamBeforeCreate', () => {
  describe('起点になるnodeに子が', () => {
    describe('いる', () => {
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
        {
          id: 3,
          title: 'bar',
          order: 1,
          parent_id: 0,
          project_id: 1,
        },
      ];
      describe('キャレットが末尾', () => {
        const result = getNodesAndReqParamBeforeCreate(list, {
          node: list[0],
          before: 'hoge',
          after: '',
        });
        it('起点nodeのtitleはそのままで子のorderをずらした一覧を返すこと', () => {
          expect(result.list).toEqual([
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
              parent_id: 1,
              project_id: 1,
            },
            {
              id: 3,
              title: 'bar',
              order: 1,
              parent_id: 0,
              project_id: 1,
            },
          ]);
        });
        it('titleが空の子を新規作成するリクエストパラメータを返すこと', () => {
          expect(result.req).toEqual({
            id: null,
            title: '',
            order: 0,
            parent_id: 1,
            project_id: 1,
          });
        });
      });
      describe('キャレットが末尾じゃない', () => {
        const result = getNodesAndReqParamBeforeCreate(list, {
          node: list[0],
          before: 'ho',
          after: 'ge',
        });
        it('起点nodeのtitleを更新して子のorderをずらした一覧を返すこと', () => {
          expect(result.list).toEqual([
            {
              id: 1,
              title: 'ho',
              order: 0,
              parent_id: 0,
              project_id: 1,
            },
            {
              id: 2,
              title: 'foo',
              order: 1,
              parent_id: 1,
              project_id: 1,
            },
            {
              id: 3,
              title: 'bar',
              order: 1,
              parent_id: 0,
              project_id: 1,
            },
          ]);
        });
        it('キャレットより後ろにある文字列をtitleに引き継いだ子を新規作成するリクエストパラメータを返すこと', () => {
          expect(result.req).toEqual({
            id: null,
            title: 'ge',
            order: 0,
            parent_id: 1,
            project_id: 1,
          });
        });
      });
    });
    describe('いない', () => {
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
          order: 2,
          parent_id: 0,
          project_id: 1,
        },
      ];
      describe('キャレットが末尾', () => {
        const result = getNodesAndReqParamBeforeCreate(list, {
          node: list[0],
          before: 'hoge',
          after: '',
        });
        it('起点nodeのtitleはそのままで弟のorderをずらした一覧を返すこと', () => {
          expect(result.list).toEqual([
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
              order: 2,
              parent_id: 0,
              project_id: 1,
            },
            {
              id: 3,
              title: 'bar',
              order: 3,
              parent_id: 0,
              project_id: 1,
            },
          ]);
        });
        it('titleが空の弟を新規作成するリクエストパラメータを返すこと', () => {
          expect(result.req).toEqual({
            id: null,
            title: '',
            order: 1,
            parent_id: 0,
            project_id: 1,
          });
        });
      });
      describe('キャレットが末尾じゃない', () => {
        const result = getNodesAndReqParamBeforeCreate(list, {
          node: list[0],
          before: 'ho',
          after: 'ge',
        });
        it('起点nodeのtitleを更新して弟のorderをずらした一覧を返すこと', () => {
          expect(result.list).toEqual([
            {
              id: 1,
              title: 'ho',
              order: 0,
              parent_id: 0,
              project_id: 1,
            },
            {
              id: 2,
              title: 'foo',
              order: 2,
              parent_id: 0,
              project_id: 1,
            },
            {
              id: 3,
              title: 'bar',
              order: 3,
              parent_id: 0,
              project_id: 1,
            },
          ]);
        });
        it('キャレットより後ろにある文字列をtitleに引き継いだ弟を新規作成するリクエストパラメータを返すこと', () => {
          expect(result.req).toEqual({
            id: null,
            title: 'ge',
            order: 1,
            parent_id: 0,
            project_id: 1,
          });
        });
      });
    });
  });
});

describe('findNodeToBeFocusedAfterDelete', () => {
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

    const node = findNodeToBeFocusedAfterDelete(list, target);
    expect(node).toBe(null);
  });

  describe('兄がいない', () => {
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
        const node = findNodeToBeFocusedAfterDelete(list, target);
        expect(node).toEqual(list[0]);
      });
    });
    describe('親がいない', () => {
      it('nullを返すこと', () => {
        const target = list[0];
        const node = findNodeToBeFocusedAfterDelete(list, target);
        expect(node).toBe(null);
      });
    });
  });

  describe('兄がいる', () => {
    describe('自身が兄弟の先頭じゃない', () => {
      describe('兄に子がいない', () => {
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
        ];
        /*
        - 1: hoge
        - 2: foo
        */
        it('兄を返すこと', () => {
          const target = list[1];
          const node = findNodeToBeFocusedAfterDelete(list, target);
          expect(node).toEqual(list[0]);
        });
      });
      describe('兄に子がいる', () => {
        describe('末子に子がいない', () => {
          it('nullを返すこと', () => {
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
                parent_id: 0,
                project_id: 1,
              },
              {
                id: 3,
                title: 'bar',
                order: 1,
                parent_id: 1,
                project_id: 1,
              },
              {
                id: 4,
                title: 'baz',
                order: 1,
                parent_id: 0,
                project_id: 1,
              },
            ];
            /*
            - 1: hoge
              - 2: foo
              - 3: bar
            - 4: baz
            */
            const target = list[3];
            const node = findNodeToBeFocusedAfterDelete(list, target);
            expect(node).toEqual(null);
          });
        });
        describe('末子に子がいる', () => {
          it('nullを返すこと', () => {
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
            ];
            /*
            - 1: hoge
              - 2: foo
                - 3: bar
                - 4: baz
            - 5: boo
            */
            const target = list[4];
            const node = findNodeToBeFocusedAfterDelete(list, target);
            expect(node).toEqual(null);
          });
        });
      });
    });

    describe('自身が兄弟の先頭', () => {
      describe('親がいる', () => {
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
          {
            id: 3,
            title: 'bar',
            order: 1,
            parent_id: 1,
            project_id: 1,
          },
        ];
        /*
        - 1: hoge
          - 2: foo
          - 3: bar
        */
        it('親を返すこと', () => {
          const target = list[1];
          const node = findNodeToBeFocusedAfterDelete(list, target);
          expect(node).toEqual(list[0]);
        });
      });
      describe('親がいない', () => {
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
            parent_id: 1,
            project_id: 1,
          },
        ];
        /*
        - 1: hoge
        - 2: foo
          - 3: bar
        */
        it('nullを返すこと', () => {
          const target = list[0];
          const node = findNodeToBeFocusedAfterDelete(list, target);
          expect(node).toBe(null);
        });
      });
    });
  });
});

describe('findNodeOnBack', () => {
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

    const node = findNodeOnBack(list, target);
    expect(node).toBe(null);
  });

  describe('兄がいない', () => {
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
        const node = findNodeOnBack(list, target);
        expect(node).toEqual(list[0]);
      });
    });
    describe('親がいない', () => {
      it('nullを返すこと', () => {
        const target = list[0];
        const node = findNodeOnBack(list, target);
        expect(node).toBe(null);
      });
    });
  });

  describe('兄がいる', () => {
    describe('自身が兄弟の先頭じゃない', () => {
      describe('兄に子がいない', () => {
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
        ];
        /*
        - 1: hoge
        - 2: foo
        */
        it('兄を返すこと', () => {
          const target = list[1];
          const node = findNodeOnBack(list, target);
          expect(node).toEqual(list[0]);
        });
      });
      describe('兄に子がいる', () => {
        describe('末子に子がいない', () => {
          it('末子を返すこと', () => {
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
                parent_id: 0,
                project_id: 1,
              },
              {
                id: 3,
                title: 'bar',
                order: 1,
                parent_id: 1,
                project_id: 1,
              },
              {
                id: 4,
                title: 'baz',
                order: 1,
                parent_id: 0,
                project_id: 1,
              },
            ];
            /*
            - 1: hoge
              - 2: foo
              - 3: bar
            - 4: baz
            */
            const target = list[3];
            const node = findNodeOnBack(list, target);
            expect(node).toEqual(list[2]);
          });
        });
        describe('末子に子がいる', () => {
          it('末子の子を返すこと', () => {
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
            ];
            /*
            - 1: hoge
              - 2: foo
                - 3: bar
                - 4: baz
            - 5: boo
            */
            const target = list[4];
            const node = findNodeOnBack(list, target);
            expect(node).toEqual(list[3]);
          });
        });
      });
    });

    describe('自身が兄弟の先頭', () => {
      describe('親がいる', () => {
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
          {
            id: 3,
            title: 'bar',
            order: 1,
            parent_id: 1,
            project_id: 1,
          },
        ];
        /*
        - 1: hoge
          - 2: foo
          - 3: bar
        */
        it('親を返すこと', () => {
          const target = list[1];
          const node = findNodeOnBack(list, target);
          expect(node).toEqual(list[0]);
        });
      });
      describe('親がいない', () => {
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
            parent_id: 1,
            project_id: 1,
          },
        ];
        /*
        - 1: hoge
        - 2: foo
          - 3: bar
        */
        it('nullを返すこと', () => {
          const target = list[0];
          const node = findNodeOnBack(list, target);
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
