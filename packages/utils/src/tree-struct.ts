// written by huyongkang
import { cloneData as $cloneData } from './helper';

export interface BaseTreeOptions {
  /**
   * id映射键名。
   *
   * @default id
   */
  id?: string;
  /**
   * 子级键名映射。
   *
   * @default children
   */
  children?: string;
  onlyLeaf?: boolean;
}

export type SearchTreeOptions = Omit<BaseTreeOptions, 'id'>;

export interface BuildTreeOptions extends BaseTreeOptions {
  /**
   * 指定父级id的属性名。
   *
   * @default parentId
   */
  parentId?: string;
  /**
   * 当有多个根节点抛出错误
   * @default true
   */
  throwErrorWhenHasTooMuchRootNodes?: boolean;
  /**
   * 是否克隆原始数据
   * @default true
   */
  cloneData?: boolean;
}

type WalkTreeNodeInfo<T> = {
  /**
   * 是否是叶子节点
   */
  isLeaf: boolean;
  /**
   * 当前节点的深度
   */
  curDepth: number;
  parent: T | null;
  /**
   * 在子节点列表中所处位置
   */
  index: number;
};

function _walkTree<T extends object>(
  tree: T[],
  visit: (node: T, nodeInfo: WalkTreeNodeInfo<T>, stopWalk: () => void, stopWalkChildren: () => void) => any,
  lastDepth: number,
  parentNode: T | null,
  options?: SearchTreeOptions,
) {
  let breakIter = false;
  const { onlyLeaf = false, children = 'children' } = options || {};
  const curDepth = lastDepth + 1;
  const stopWalk = () => {
    breakIter = true;
  };

  return tree.some((item: any, index) => {
    const isLeaf = !item[children] || !item[children].length;
    let onExit;
    let childrenBreak = false;

    const stopWalkChildren = () => {
      childrenBreak = true;
    };

    if ((isLeaf && onlyLeaf) || !onlyLeaf) {
      onExit = visit(item, { isLeaf, curDepth, parent: parentNode, index }, stopWalk, stopWalkChildren);
    }

    if (breakIter) {
      return true;
    }

    const subTree = item[children];

    if (subTree && !childrenBreak) {
      const flag = _walkTree(subTree, visit, curDepth, item, options);

      onExit?.(); // 所有子节点已处理

      return flag;
    } else {
      onExit?.();
    }

    return false;
  });
}

/**
 * 遍历树
 *
 * 一般用于查找数据
 *
 * 额外用途：例如可以用来改变节点字段名
 *
 * @description
 * `visit`方法返回一个函数将会在节点退出阶段执行（此时当前节点下的所有子节点已处理完毕）
 * @template T
 * @param {T[]} tree
 * @param {(node: T, nodeInfo: WalkTreeNodeInfo, stopWalk: () => void) => any} visit 访问到节点
 * @param {SearchTreeOptions} [options]
 * @param {string} [options.children=children] - 子级字段名。默认: `children`
 * @param {boolean} [options.onlyLeaf=false] - 是否只查找叶子节点数据。默认: `false`
 * @returns {T[]}
 */
export function walkTree<T extends object>(tree: T[], visit: (node: T, nodeInfo: WalkTreeNodeInfo<T>, stopWalk: () => void, stopWalkChildren: () => void) => any, options?: SearchTreeOptions) {
  return _walkTree(tree, visit, 0, null, options);
}

/**
 * 获取树深度
 * @param {object[]} tree
 * @param {SearchTreeOptions} [options]
 * @returns {number}
*/
export function getTreeDepth(tree: object[], options?: SearchTreeOptions) {
  let depth = 0;

  walkTree(tree, (_, nodeInfo) => {
    depth = Math.max(depth, nodeInfo.curDepth);
  }, options);

  return depth;
}

/**
 * 搜索树所有结果
 * @template T
 * @param {T[]} tree
 * @param {(node: T) => boolean} cond 返回true表明此节点满足要求
 * @param {SearchTreeOptions} [options]
 * @param {string} [options.children=children] - 子级字段名。默认: `children`
 * @param {boolean} [options.onlyLeaf=false] - 是否只查找叶子节点数据。默认: `false`
 * @returns {T[]}
 */
export function searchTree<T extends object>(tree: T[], cond: (node: T) => boolean, options?: SearchTreeOptions) {
  const results: T[] = [];

  walkTree(tree, (node) => {
    if (cond(node)) {
      results.push(node);
    }
  }, options);

  return results;
}

/**
 * 根据唯一树节点id查找此节点的数据
 * @param {T[]} tree - 原始数据
 * @param {string|number} nodeId - 查找的节点id
 * @param {BaseTreeOptions} [options]
 * @returns {T|undefined}
 */
export function getTreeNodeDataById<T extends object>(tree: T[], nodeId: string | number, options?: BaseTreeOptions): T | undefined {
  const idField = options?.id || 'id';
  let nodeData;

  walkTree(tree, (node, _, stopWalk) => {
    if (Reflect.get(node, idField) === nodeId) {
      nodeData = node;

      stopWalk();
    }
  }, options);

  return nodeData;
}

/**
 * 获取树节点完整路径
 *
 * @template T
 * @param {T[]} tree - 原始数据
 * @param {string|number} nodeId - 查找的节点id
 * @param {BaseTreeOptions} [options]
 * @returns {T[]}
 */
export function getTreeFullPath<T extends object>(tree: T[], nodeId: string | number, options?: BaseTreeOptions): T[] {
  const nodePath: T[] = [];
  const idField = options?.id || 'id';
  let finded = false;
  let lastVisitedNodeDepth = 0;

  walkTree(tree, (node, nodeInfo, stopWalk) => {
    if (Reflect.get(node, idField) === nodeId) {
      finded = true;

      stopWalk();
    }

    if (nodeInfo.curDepth <= lastVisitedNodeDepth) {
      nodePath.splice(-1 - (lastVisitedNodeDepth - nodeInfo.curDepth));
    }

    nodePath.push(node);

    lastVisitedNodeDepth = nodeInfo.curDepth;
  }, options);

  return finded ? nodePath : [];
}

/**
 * 将数组组装成一颗树
 * @template T
 * @param {T[]} data - 一个一维数组
 * @param {BuildTreeOptions} [options]
 * @param {string} [options.id] - 唯一id的属性名。默认: `id`
 * @param {string} [options.parentId] - 指定父级id的属性名。默认: `parentId`
 * @param {string} [options.children] - 指定子级的属性名。默认: `children`
 * @example
 *
 const data = [
  {
      parent_id: 1,
      id: 2,
      name: 'b',
  },
  {
      parent_id: 2,
      id: 3,
      name: 'c',
  },
  {
      parent_id: null,
      id: 1,
      name: 'a',
  },
  {
      parent_id: 2,
      id: 4,
      name: 'd',
  },
  {
      parent_id: 1,
      id: 5,
      name: 'e',
  },
  {
      parent_id: 3,
      id: 6,
      name: 'f',
  },
  {
      parent_id: 8,
      id: 7,
      name: 'ss',
  },
  {
      parent_id: 1,
      id: 8,
      name: 'dfs',
  },
];

arrayToTree(data, {
  id: 'id',
  parentId: 'parent_id',
  children: 'children'
})
// 返回结果为
[
  {
    "children": [
      {
        "children": [
          {
            "children": [
              {
                "children": [],
                "id": 6,
                "name": "f",
                "parent_id": 3
              }
            ],
            "id": 3,
            "name": "c",
            "parent_id": 2
          },
          {
            "children": [],
            "id": 4,
            "name": "d",
            "parent_id": 2
          }
        ],
        "id": 2,
        "name": "b",
        "parent_id": 1
      },
      {
        "children": [],
        "id": 5,
        "name": "e",
        "parent_id": 1
      },
      {
        "children": [
          {
            "children": [],
            "id": 7,
            "name": "ss",
            "parent_id": 8
          }
        ],
        "id": 8,
        "name": "dfs",
        "parent_id": 1
      }
    ],
    "id": 1,
    "name": "a",
    "parent_id": null
  }
]
 *
 */
export function array2Tree<T extends object>(tree: Array<T>, options?: BuildTreeOptions): T[] {
  if (tree.length <= 1) {
    return tree;
  }

  const {
    id = 'id',
    children = 'children',
    parentId = 'parentId',
    throwErrorWhenHasTooMuchRootNodes = true,
    cloneData = true,
  } = options || {};

  const data = cloneData ? $cloneData(tree) : tree;

  const createChildren = (child: any, rsArr: T[] = []) => {
    return rsArr.some((_: any) => {
      if (child !== _ && child[parentId] === _[id]) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        child[children] = child[children] || [];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        _[children] = _[children] || [];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        (_[children] as any[]).push(child);

        return true;
      }

      return false;
    });
  };

  const roots: T[] = [];

  data.forEach((_) => {
    if (!createChildren(_, data)) {
      roots.push(_);
    }
  });

  // 判断是否至少有两个节点没有父级
  if (throwErrorWhenHasTooMuchRootNodes && roots.length > 1) {
    throw new Error(`exist ${roots.length} node-items not have parent-node.`);
  }

  return roots;
}

/**
 * 平铺树结构数据
 * @template T
 * @param {T[]} tree
 * @param {SearchTreeOptions} [options]
 * @returns {T[]}
 */
export function tree2Array<T extends object>(tree: T[], options?: SearchTreeOptions) {
  return searchTree(tree, () => true, options);
}
