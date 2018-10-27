import {
  findNodeOnBack,
  findNodeOnForward,
  findNodeToBeFocusedAfterDelete,
  getNodesAndDiffsAfterPromoted,
  getNodesAndDiffsAfterRelegate,
  getNodesAndReqParamBeforeCreate,
  getNodesAndReqParamBeforeDelete,
} from '~/modules/nodes/utils';

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
        const result = getNodesAndReqParamBeforeCreate(list, list[0], {
          left: 'hoge',
          right: '',
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
        const result = getNodesAndReqParamBeforeCreate(list, list[0], {
          left: 'ho',
          right: 'ge',
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
        const result = getNodesAndReqParamBeforeCreate(list, list[0], {
          left: 'hoge',
          right: '',
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
        it('起点nodeのtitleを更新して弟のorderをずらした一覧を返すこと', () => {
          const result = getNodesAndReqParamBeforeCreate(list, list[0], {
            left: 'ho',
            right: 'ge',
          });
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
          const result = getNodesAndReqParamBeforeCreate(list, list[0], {
            left: 'ho',
            right: 'ge',
          });
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

describe('getNodesAndReqParamBeforeDelete', () => {
  describe('削除されるnodeに弟がいる', () => {
    describe('削除されるnodeに子がいる', () => {
      describe('削除されるnodeのタイトルの引き継ぎがない', () => {
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
        */
        const target = list[1];
        const beFocused = list[0];
        const rightEnd = '';
        const result = getNodesAndReqParamBeforeDelete(
          list,
          target,
          beFocused,
          rightEnd,
        );
        it('削除対象を除外、削除対象の子をfocus移動先に引き継ぎ、削除対象の弟のorderを更新すること', () => {
          expect(result.list).toEqual([
            {
              id: 1,
              title: 'hoge',
              order: 0,
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
            {
              id: 4,
              title: 'baz',
              order: 1,
              parent_id: 0,
              project_id: 1,
            },
          ]);
        });
        it('フォーカス移動先のnodeに変更がないのでnullを返すこと', () => {
          expect(result.req).toBe(null);
        });
      });
      describe('削除されるnodeのタイトルの引き継ぎがある', () => {
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
        */
        const target = list[1];
        const beFocused = list[0];
        const rightEnd = 'oo';
        const result = getNodesAndReqParamBeforeDelete(
          list,
          target,
          beFocused,
          rightEnd,
        );
        it('削除対象を除外、削除対象の子とタイトルをfocus移動先が引き継ぎ、削除対象の弟のorderを更新すること', () => {
          expect(result.list).toEqual([
            {
              id: 1,
              title: 'hogeoo',
              order: 0,
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
            {
              id: 4,
              title: 'baz',
              order: 1,
              parent_id: 0,
              project_id: 1,
            },
          ]);
        });
        it('titleを更新したfocus移動先のnodeを返すこと', () => {
          expect(result.req).toEqual({
            id: 1,
            title: 'hogeoo',
            order: 0,
            parent_id: 0,
            project_id: 1,
          });
        });
      });
    });
    describe('削除されるnodeに子がいない', () => {
      describe('削除されるnodeのタイトルの引き継ぎがない', () => {
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
        /*
        - 1: hoge
        - 2: foo
        - 3: bar
        */
        const target = list[1];
        const beFocused = list[0];
        const rightEnd = '';
        const result = getNodesAndReqParamBeforeDelete(
          list,
          target,
          beFocused,
          rightEnd,
        );
        it('削除対象を除外、削除対象の子をfocus移動先に引き継ぎ、削除対象の弟のorderを更新すること', () => {
          expect(result.list).toEqual([
            {
              id: 1,
              title: 'hoge',
              order: 0,
              parent_id: 0,
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
        it('フォーカス移動先のnodeに変更がないのでnullを返すこと', () => {
          expect(result.req).toBe(null);
        });
      });
      describe('削除されるnodeのタイトルの引き継ぎがある', () => {
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
        /*
        - 1: hoge
        - 2: foo
        - 3: bar
        */
        const target = list[1];
        const beFocused = list[0];
        const rightEnd = 'oo';
        const result = getNodesAndReqParamBeforeDelete(
          list,
          target,
          beFocused,
          rightEnd,
        );
        it('削除対象を除外、削除対象の子とタイトルをfocus移動先が引き継ぎ、削除対象の弟のorderを更新すること', () => {
          expect(result.list).toEqual([
            {
              id: 1,
              title: 'hogeoo',
              order: 0,
              parent_id: 0,
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
        it('titleを更新したfocus移動先のnodeを返すこと', () => {
          expect(result.req).toEqual({
            id: 1,
            title: 'hogeoo',
            order: 0,
            parent_id: 0,
            project_id: 1,
          });
        });
      });
    });
  });
  describe('削除されるnodeに弟がいない', () => {
    describe('削除されるnodeに子がいる', () => {
      describe('削除されるnodeのタイトルの引き継ぎがない', () => {
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
        ];
        /*
        - 1: hoge
        - 2: foo
          - 3: bar
          - 4: baz
        */
        const target = list[1];
        const beFocused = list[0];
        const rightEnd = '';
        const result = getNodesAndReqParamBeforeDelete(
          list,
          target,
          beFocused,
          rightEnd,
        );
        it('削除対象を除外、削除対象の子をfocus移動先に引き継ぐこと', () => {
          expect(result.list).toEqual([
            {
              id: 1,
              title: 'hoge',
              order: 0,
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
            {
              id: 4,
              title: 'baz',
              order: 1,
              parent_id: 1,
              project_id: 1,
            },
          ]);
        });
        it('focus移動先のnodeに変更がないのでnullを返すこと', () => {
          expect(result.req).toBe(null);
        });
      });
      describe('削除されるnodeのタイトルの引き継ぎがある', () => {
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
        ];
        /*
        - 1: hoge
        - 2: foo
          - 3: bar
          - 4: baz
        */
        const target = list[1];
        const beFocused = list[0];
        const rightEnd = 'oo';
        const result = getNodesAndReqParamBeforeDelete(
          list,
          target,
          beFocused,
          rightEnd,
        );
        it('削除対象を除外、titleを更新したfocus移動先に削除対象の子を引き継ぐこと', () => {
          expect(result.list).toEqual([
            {
              id: 1,
              title: 'hogeoo',
              order: 0,
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
            {
              id: 4,
              title: 'baz',
              order: 1,
              parent_id: 1,
              project_id: 1,
            },
          ]);
        });
        it('titleを更新したfocus移動先のnodeを返すこと', () => {
          expect(result.req).toEqual({
            id: 1,
            title: 'hogeoo',
            order: 0,
            parent_id: 0,
            project_id: 1,
          });
        });
      });
    });
    describe('削除されるnodeに子がいない', () => {
      describe('削除されるnodeのタイトルの引き継ぎがない', () => {
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
        /*
        - 1: hoge
          - 2: foo
        - 3: bar
        */
        const target = list[2];
        const beFocused = list[1];
        const rightEnd = '';
        const result = getNodesAndReqParamBeforeDelete(
          list,
          target,
          beFocused,
          rightEnd,
        );
        it('削除対象を除外すること', () => {
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
              order: 0,
              parent_id: 1,
              project_id: 1,
            },
          ]);
        });
        it('focus移動先のnodeに変更がないのでnullを返すこと', () => {
          expect(result.req).toBe(null);
        });
      });
      describe('削除されるnodeのタイトルの引き継ぎがある', () => {
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
        /*
        - 1: hoge
          - 2: foo
        - 3: bar
        */
        const target = list[2];
        const beFocused = list[1];
        const rightEnd = 'ar';
        const result = getNodesAndReqParamBeforeDelete(
          list,
          target,
          beFocused,
          rightEnd,
        );
        it('削除対象を除外、focus移動先のtitleを更新すること', () => {
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
              title: 'fooar',
              order: 0,
              parent_id: 1,
              project_id: 1,
            },
          ]);
        });
        it('titleを更新したfocus移動先のnodeを返すこと', () => {
          expect(result.req).toEqual({
            id: 2,
            title: 'fooar',
            order: 0,
            parent_id: 1,
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
        it('兄を返すこと', () => {
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
        it('親を返すこと', () => {
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
          const target = list[1];
          const node = findNodeToBeFocusedAfterDelete(list, target);
          expect(node).toEqual(list[0]);
        });
      });
      describe('親がいない', () => {
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

describe('findNodeOnForward', () => {
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
  describe('子がいる', () => {
    it('先頭の子を返す', () => {
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
      const result = findNodeOnForward(list, list[0]);
      expect(result).toEqual(list[1]);
    });
  });
  describe('子がいない', () => {
    describe('弟がいる', () => {
      it('弟を返す', () => {
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
        const result = findNodeOnForward(list, list[0]);
        expect(result).toEqual(list[1]);
      });
    });
    describe('弟がいない', () => {
      describe('親に弟がいる', () => {
        it('親の弟を返すこと', () => {
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
              parent_id: 1,
              project_id: 1,
            },
            {
              id: 5,
              title: 'boo',
              order: 2,
              parent_id: 1,
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
          const result = findNodeOnForward(list, list[2]);
          expect(result).toEqual(list[3]);
        });
      });
      describe('祖父に弟がいる', () => {
        it('祖父の弟を返すこと', () => {
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
              order: 0,
              parent_id: 3,
              project_id: 1,
            },
            {
              id: 5,
              title: 'boo',
              order: 1,
              parent_id: 1,
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
          const result = findNodeOnForward(list, list[3]);
          expect(result).toEqual(list[4]);
        });
      });
      describe('曽祖父に弟がいる', () => {
        it('曽祖父の弟を返すこと', () => {
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
              order: 0,
              parent_id: 3,
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
          const result = findNodeOnForward(list, list[3]);
          expect(result).toEqual(list[4]);
        });
      });
      describe('先祖に弟がいない', () => {
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
          ];
          /*
          - 1: hoge
            - 2: foo
              - 3: bar
          */
          const result = findNodeOnForward(list, list[2]);
          expect(result).toEqual(null);
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
