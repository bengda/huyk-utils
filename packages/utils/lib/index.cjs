'use strict';

function getType(arg) {
  return Object.prototype.toString.call(arg).slice(8, -1).toLowerCase();
}
function isType(input, type) {
  return getType(input) === type;
}
function isArray(arg) {
  return getType(arg) === "array";
}
function isNull(arg) {
  return getType(arg) === "null";
}
function isLooseObject(arg) {
  return typeof arg === "object" && !isNull(arg) && !isArray(arg);
}
function isObject(arg) {
  return isLooseObject(arg);
}
function isStrictObject(arg) {
  return getType(arg) === "object";
}
function isString(arg) {
  return getType(arg) === "string";
}
function isNumber(arg) {
  return getType(arg) === "number";
}
function isBoolean(arg) {
  return getType(arg) === "boolean";
}
function isFunction(arg) {
  return getType(arg) === "function";
}
function isDate(arg) {
  return getType(arg) === "date";
}
function isNaN(arg) {
  return isNumber(arg) && arg !== arg;
}
function isUndefined(arg) {
  return getType(arg) === "undefined";
}
function isNullOrUndefined(arg) {
  return isNull(arg) || isUndefined(arg);
}
function isSymbol(arg) {
  return getType(arg) === "symbol";
}
function isPrimitive(arg) {
  return isNullOrUndefined(arg) || isNumber(arg) || isString(arg) || isBoolean(arg) || isSymbol(arg);
}
function isComplex(arg) {
  return isLooseObject(arg) || isArray(arg) || isFunction(arg);
}
function isComplexButNotFunctionType(arg) {
  return isComplex(arg) && !isFunction(arg);
}
function isDom(arg) {
  return arg === window || arg === document || arg instanceof HTMLElement;
}
function isEle(arg) {
  return arg instanceof HTMLElement;
}
function isPlainObject(arg) {
  return isObject(arg) && Object.getPrototypeOf(arg) === Object.prototype;
}
function isEmptyObject(arg) {
  return isObject(arg) && !Object.keys(arg).length;
}
function isNumeric(arg) {
  return !isArray(arg) && /^[+-]?[0-9]\d*$|^[+-]?[0-9]\d*\.\d+$/g.test(arg);
}
function maybeInteger(arg) {
  return isNumeric(arg) && Math.floor(arg) === Number(arg);
}
function isInteger(arg) {
  return isNumber(arg) && maybeInteger(arg);
}
function maybeFloatNumber(arg) {
  return isNumeric(arg) && /^[+-]?[0-9]\d*\.\d+$/g.test(arg);
}
function isFloatNumber(arg) {
  return isNumber(arg) && maybeFloatNumber(arg);
}
function isValidDateArg(arg) {
  if (isString(arg) || isDate(arg) || isNumber(arg)) {
    return new Date(arg).toString() !== "Invalid Date";
  }
  return false;
}

const QUERY_REG = /(?:\?(.+))/;
const HASH_SPLIT_REG = /\/?#\/?/;
function decodeURI2Str(uri) {
  try {
    const parsed = decodeURIComponent(uri);
    if (parsed === uri) {
      return uri;
    }
    return decodeURI2Str(parsed);
  } catch (error) {
    return uri;
  }
}
function getUrlQuery(url, options) {
  const { position = "query", decode = true } = options || {};
  const urlSplits = url.split(HASH_SPLIT_REG);
  if (position === "hash") {
    return getUrlQuery(urlSplits[1] || "", { position: "search", decode });
  }
  const theRequest = {};
  const urlPath = urlSplits[0] || "";
  const queryStrRes = QUERY_REG.exec(urlPath);
  const queryStrings = queryStrRes ? queryStrRes[1] : "";
  const strs = queryStrings ? queryStrings.split("&") : [];
  strs.forEach((unitStr) => {
    const { 1: name, 2: value } = /^([^=]+)=(.*)$/.exec(unitStr) || [];
    if (name) {
      theRequest[name] = decode ? decodeURI2Str(value) : value;
    }
  });
  return theRequest;
}
function extendUrl(url, options) {
  const { query = {}, remove = [], encode = true, position = "search" } = options || {};
  const urlRawQuery = getUrlQuery(url, { position, decode: encode });
  const querys = [];
  const { 0: queryUrl = "", 1: hashUrl = "" } = url.split(HASH_SPLIT_REG);
  const hashMatchRes = url.match(HASH_SPLIT_REG);
  const hashSplitChar = hashMatchRes ? hashMatchRes[0] : "";
  const queryRes = QUERY_REG.exec(queryUrl);
  const queryMark = `@query${Date.now()}@`;
  let queryStr = queryRes ? queryRes[1] : "";
  let $queryUrl = queryUrl;
  if (queryStr) {
    $queryUrl = $queryUrl.replace(queryStr, queryMark);
  }
  Object.assign(urlRawQuery, query);
  Object.keys(urlRawQuery).forEach((key) => {
    const flag = remove.some((item) => {
      if (Object.prototype.toString.call(item) === "[object RegExp]") {
        return item.test(key);
      }
      return item === key;
    });
    if (!flag) {
      querys.push(`${key}=${encode ? encodeURIComponent(urlRawQuery[key]) : urlRawQuery[key]}`);
    }
  });
  const path = querys.join("&");
  switch (position) {
    case "search": {
      queryStr = path;
      if ($queryUrl.indexOf(queryMark) < 0) {
        $queryUrl = queryUrl + queryMark;
      }
      if (path && !/\?$/.test($queryUrl.split(queryMark)[0])) {
        queryStr = `?${queryStr}`;
      }
      return $queryUrl.replace(queryMark, queryStr) + hashSplitChar + hashUrl;
    }
    case "hash": {
      const hashUrlResult = extendUrl(hashUrl, {
        query,
        remove,
        position: "search",
        encode
      });
      return queryUrl + (hashUrlResult ? hashSplitChar || "#" : hashSplitChar) + hashUrlResult;
    }
  }
  return url;
}
function safeParse(obj, fallbackValue = {}) {
  try {
    return JSON.parse(obj);
  } catch {
    return fallbackValue;
  }
}
function omit(obj, fields) {
  const ret = {};
  Object.entries(obj).forEach(([p, v]) => {
    if (!fields.includes(p)) {
      Reflect.set(ret, p, v);
    }
  });
  return ret;
}
function nonNullable(obj) {
  return Object.entries(obj).reduce((hoist, [k, v]) => {
    if (v !== null && v !== void 0) {
      Reflect.set(hoist, k, v);
    }
    return hoist;
  }, {});
}
function pick(obj, fields) {
  const ret = {};
  Object.entries(obj).forEach(([p, v]) => {
    if (fields.includes(p)) {
      Reflect.set(ret, p, v);
    }
  });
  return ret;
}
function delayResolve(data) {
  let tid;
  let res;
  let rej;
  const p = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });
  const after = (delay) => {
    tid = setTimeout(() => res?.(data), delay);
    return p;
  };
  const cancel = () => {
    clearTimeout(tid);
    rej?.(new Error("delay task canceled."));
  };
  return {
    after,
    cancel
  };
}
function createAsyncLooper(params) {
  const { handler, timeout = 3e3, delay = 500 } = params;
  const asyncRunner = () => new Promise((resolve, reject) => {
    let finished = false;
    let err = new Error(`execution time over ${timeout} ms`);
    let delayer = delayResolve(0);
    const tid = setTimeout(() => {
      finished = true;
      reject(err);
    }, timeout);
    const abort = () => {
      delayer.cancel();
      finished = true;
      reject({ aborted: true });
    };
    const run = async () => {
      try {
        const res = await handler(abort);
        clearTimeout(tid);
        finished = true;
        delayer.cancel();
        resolve(res);
      } catch (error) {
        err = error;
        if (!finished) {
          delayer = delayResolve(0);
          delayer.after(delay).then(() => {
            if (!finished) {
              run();
            }
          });
        }
      }
    };
    run();
  });
  return asyncRunner;
}
function makeGetterSetter(defalutValue) {
  let val = defalutValue;
  const getVal = () => val;
  const setVal = (newVal) => {
    val = typeof newVal === "function" ? newVal(val) : newVal;
    return val;
  };
  return [getVal, setVal];
}
function compareSemanticVersion(a, b) {
  const pa = Object.assign(["0", "0", "0"], a.split("."));
  const pb = Object.assign(["0", "0", "0"], b.split("."));
  for (let i = 0; i < 3; i += 1) {
    const na = Number(pa[i]);
    const nb = Number(pb[i]);
    if (na > nb)
      return 1;
    if (nb > na)
      return -1;
    if (!Number.isNaN(na) && Number.isNaN(nb))
      return 1;
    if (Number.isNaN(na) && !Number.isNaN(nb))
      return -1;
  }
  return 0;
}
function formatString(inputStr, mapParams) {
  let text = inputStr;
  Object.keys(mapParams).forEach((prop) => {
    text = text.replace(new RegExp(`\\{\\s*${prop}\\s*\\}`, "g"), mapParams[prop]);
  });
  return text;
}
function isCircular(target) {
  const walk = (obj, stack) => {
    const isObjectType = ["array", "object"].includes(getType(obj));
    if (isObjectType) {
      if (stack.includes(obj)) {
        return true;
      }
      stack.push(obj);
      const flag = Object.values(obj).some((v) => walk(v, stack));
      stack.pop();
      return flag;
    }
    return false;
  };
  return walk(target, []);
}
function cloneData(target) {
  if (isCircular(target)) {
    throw new Error("has circular structure.");
  }
  const copy = (data) => {
    const isArray = getType(data) === "array";
    const isObject = getType(data) === "object";
    const isArrayOrObject = isArray || isObject;
    if (isArrayOrObject) {
      const hoist = isArray ? [] : {};
      for (const [k, v] of Object.entries(data)) {
        hoist[k] = cloneData(v);
      }
      return hoist;
    }
    return data;
  };
  return copy(target);
}
function exist(o, k) {
  if (!k) {
    return null !== o && void 0 !== o;
  }
  try {
    const keys = k.split(".");
    const sub = o[keys.at(0)];
    return exist(sub, keys.slice(1).join("."));
  } catch (error) {
    return false;
  }
}
function extract(o, k) {
  if (!k) {
    return o;
  }
  try {
    const keys = k.split(".");
    const sub = o[keys.at(0)];
    return extract(sub, keys.slice(1).join("."));
  } catch (error) {
    return void 0;
  }
}
function objectKeyPathValue(o) {
  const ret = [];
  const walk = (obj, keyPath) => {
    ret.push({ path: keyPath.concat(), value: obj });
    if (isPlainObject(obj)) {
      Object.entries(obj).forEach(([k, v]) => {
        keyPath.push(k);
        walk(v, keyPath);
        keyPath.pop();
      });
    }
  };
  walk(o, []);
  return ret;
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const AccProperty = Symbol("acc");
const BlocksProperty = Symbol("blocks");
class AsyncExecutionLimiter {
  constructor(params) {
    /**
     * @public
     */
    __publicField(this, "limit", 1);
    /**
     * @public
     */
    __publicField(this, "race", true);
    if (params) {
      if (Reflect.has(params, "limit")) {
        this.limit = params.limit;
      }
      if (Reflect.has(params, "race")) {
        this.race = params.race;
      }
    }
    Reflect.set(this, AccProperty, 0);
    Reflect.set(this, BlocksProperty, []);
  }
  _acc() {
    return Reflect.get(this, AccProperty);
  }
  _blocks() {
    return Reflect.get(this, BlocksProperty);
  }
  /**
   * @public
   */
  async run(fn) {
    if (!fn) {
      throw new Error("fn is required.");
    }
    if (Object.prototype.toString.call(fn) !== "[object Function]") {
      throw new Error("fn must be a function.");
    }
    if (this._acc() >= this.limit) {
      await new Promise((resolve) => {
        this._blocks().push(resolve);
      });
    }
    Reflect.set(this, AccProperty, this._acc() + 1);
    try {
      return await fn();
    } finally {
      Reflect.set(this, AccProperty, this._acc() - 1);
      const blocks = this._blocks();
      if (blocks.length) {
        if (this.race) {
          blocks.pop()?.();
          blocks.length = 0;
        } else {
          blocks.shift()?.();
        }
      }
    }
  }
}

function _walkTree(tree, visit, lastDepth, parentNode, options) {
  let breakIter = false;
  const { onlyLeaf = false, children = "children" } = options || {};
  const curDepth = lastDepth + 1;
  const stopWalk = () => {
    breakIter = true;
  };
  return tree.some((item, index) => {
    const isLeaf = !item[children] || !item[children].length;
    let onExit;
    let childrenBreak = false;
    const stopWalkChildren = () => {
      childrenBreak = true;
    };
    if (isLeaf && onlyLeaf || !onlyLeaf) {
      onExit = visit(item, { isLeaf, curDepth, parent: parentNode, index }, stopWalk, stopWalkChildren);
    }
    if (breakIter) {
      return true;
    }
    const subTree = item[children];
    if (subTree && !childrenBreak) {
      const flag = _walkTree(subTree, visit, curDepth, item, options);
      onExit?.();
      return flag;
    } else {
      onExit?.();
    }
    return false;
  });
}
function walkTree(tree, visit, options) {
  return _walkTree(tree, visit, 0, null, options);
}
function getTreeDepth(tree, options) {
  let depth = 0;
  walkTree(tree, (_, nodeInfo) => {
    depth = Math.max(depth, nodeInfo.curDepth);
  }, options);
  return depth;
}
function searchTree(tree, cond, options) {
  const results = [];
  walkTree(tree, (node) => {
    if (cond(node)) {
      results.push(node);
    }
  }, options);
  return results;
}
function getTreeNodeDataById(tree, nodeId, options) {
  const idField = options?.id || "id";
  let nodeData;
  walkTree(tree, (node, _, stopWalk) => {
    if (Reflect.get(node, idField) === nodeId) {
      nodeData = node;
      stopWalk();
    }
  }, options);
  return nodeData;
}
function getTreeFullPath(tree, nodeId, options) {
  const nodePath = [];
  const idField = options?.id || "id";
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
function array2Tree(tree, options) {
  if (tree.length <= 1) {
    return tree;
  }
  const {
    id = "id",
    children = "children",
    parentId = "parentId",
    throwErrorWhenHasTooMuchRootNodes = true,
    cloneData: cloneData$1 = true
  } = options || {};
  const data = cloneData$1 ? cloneData(tree) : tree;
  const createChildren = (child, rsArr = []) => {
    return rsArr.some((_) => {
      if (child !== _ && child[parentId] === _[id]) {
        child[children] = child[children] || [];
        _[children] = _[children] || [];
        _[children].push(child);
        return true;
      }
      return false;
    });
  };
  const roots = [];
  data.forEach((_) => {
    if (!createChildren(_, data)) {
      roots.push(_);
    }
  });
  if (throwErrorWhenHasTooMuchRootNodes && roots.length > 1) {
    throw new Error(`exist ${roots.length} node-items not have parent-node.`);
  }
  return roots;
}
function tree2Array(tree, options) {
  return searchTree(tree, () => true, options);
}

const im_s_m = Symbol();
class ImmutableStore {
  static create(store) {
    const n = new ImmutableStore();
    if (store) {
      Reflect.set(n, im_s_m, cloneData(store));
    }
    return n;
  }
  constructor() {
    Reflect.set(this, im_s_m, {});
  }
  extend(extens) {
    return ImmutableStore.create(
      Object.assign({}, this[im_s_m], extens)
    );
  }
  set(k, v) {
    const keys = Object.keys(this[im_s_m]);
    if (!keys.includes(k))
      return this;
    Reflect.set(this[im_s_m], k, v);
    return this;
  }
  query(k) {
    return this[im_s_m][k];
  }
  clone() {
    return ImmutableStore.create(this[im_s_m]);
  }
  imut(k, v) {
    return ImmutableStore.create(
      Object.assign({}, this[im_s_m], { [k]: v })
    );
  }
  imuts(kv) {
    return ImmutableStore.create(
      Object.assign({}, this[im_s_m], kv)
    );
  }
  valueOf() {
    return Object.assign({}, this[im_s_m]);
  }
}

exports.AsyncExecutionLimiter = AsyncExecutionLimiter;
exports.ImmutableStore = ImmutableStore;
exports.array2Tree = array2Tree;
exports.cloneData = cloneData;
exports.compareSemanticVersion = compareSemanticVersion;
exports.createAsyncLooper = createAsyncLooper;
exports.decodeURI2Str = decodeURI2Str;
exports.delayResolve = delayResolve;
exports.exist = exist;
exports.extendUrl = extendUrl;
exports.extract = extract;
exports.formatString = formatString;
exports.getTreeDepth = getTreeDepth;
exports.getTreeFullPath = getTreeFullPath;
exports.getTreeNodeDataById = getTreeNodeDataById;
exports.getType = getType;
exports.getUrlQuery = getUrlQuery;
exports.isArray = isArray;
exports.isBoolean = isBoolean;
exports.isCircular = isCircular;
exports.isComplex = isComplex;
exports.isComplexButNotFunctionType = isComplexButNotFunctionType;
exports.isDate = isDate;
exports.isDom = isDom;
exports.isEle = isEle;
exports.isEmptyObject = isEmptyObject;
exports.isFloatNumber = isFloatNumber;
exports.isFunction = isFunction;
exports.isInteger = isInteger;
exports.isLooseObject = isLooseObject;
exports.isNaN = isNaN;
exports.isNull = isNull;
exports.isNullOrUndefined = isNullOrUndefined;
exports.isNumber = isNumber;
exports.isNumeric = isNumeric;
exports.isObject = isObject;
exports.isPlainObject = isPlainObject;
exports.isPrimitive = isPrimitive;
exports.isStrictObject = isStrictObject;
exports.isString = isString;
exports.isSymbol = isSymbol;
exports.isType = isType;
exports.isUndefined = isUndefined;
exports.isValidDateArg = isValidDateArg;
exports.makeGetterSetter = makeGetterSetter;
exports.maybeFloatNumber = maybeFloatNumber;
exports.maybeInteger = maybeInteger;
exports.nonNullable = nonNullable;
exports.objectKeyPathValue = objectKeyPathValue;
exports.omit = omit;
exports.pick = pick;
exports.safeParse = safeParse;
exports.searchTree = searchTree;
exports.tree2Array = tree2Array;
exports.walkTree = walkTree;
