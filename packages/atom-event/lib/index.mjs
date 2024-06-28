var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => {
  __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var _a$1;
const ls = Symbol();
function sortSets(sets) {
  const list = Array.from(sets).sort(
    (a, b) => a.__atom_event__options__?.order - b.__atom_event__options__?.order
  );
  sets.clear();
  list.forEach((handler) => sets.add(handler));
  return sets;
}
function add2Sets(sets, listener) {
  sets.add(listener);
  sortSets(sets);
}
function removeFromSets(sets, listener) {
  Reflect.deleteProperty(listener, "__atom_event__options__");
  return sets.delete(listener);
}
function clearSets(sets) {
  Array.from(sets).forEach((listener) => {
    Reflect.deleteProperty(listener, "__atom_event__options__");
    Reflect.deleteProperty(listener, "__atom_event__target__");
  });
  return sets.clear();
}
const _AtomEvent = class _AtomEvent {
  constructor() {
    __publicField$1(this, _a$1, /* @__PURE__ */ new Set());
  }
  /**
   * 移除某个事件监听
   * @public
   */
  off(listener) {
    return removeFromSets(this[ls], listener);
  }
  /**
   * 清除所有事件监听
   * @public
   */
  clear() {
    return clearSets(this[ls]);
  }
  /**
   * 注册一个事件监听
   * @public
   */
  on(listener, options) {
    if (typeof listener !== "function") {
      return () => true;
    }
    if (options?.once) {
      return this.once(listener, Object.assign({}, options, { once: false }));
    }
    listener.__atom_event__options__ = { order: 999, ...options || {} };
    add2Sets(this[ls], listener);
    return () => this.off(listener);
  }
  /**
   * 注册一个只执行一次的事件
   * @public
   */
  once(listener, options) {
    if (typeof listener !== "function") {
      return () => true;
    }
    const handler = listener.__atom_event__target__ || ((...params) => {
      this.off(handler);
      Reflect.deleteProperty(listener, "__atom_event__target__");
      listener?.(...params);
    });
    listener.__atom_event__target__ = handler;
    return this.on(handler, options);
  }
  /**
   * 触发所有已注册的事件
   * @public
   */
  emit(payload, options) {
    const {
      sync = false,
      abortWhenErrorOccured = false,
      onlyThrowFirstError = true
    } = options || {};
    let abortFlag = false;
    let abortReason = "";
    const aborter = (reason) => {
      abortFlag = true;
      abortReason = reason || "";
    };
    const list = Array.from(this[ls]);
    const errors = [];
    let index = 0;
    const run = async () => {
      for (const listener of list) {
        if (abortFlag) {
          console.warn(
            `received abort flag${abortReason ? ` of reason: ${abortReason}` : ""}, left ${list.length - index} listeners will not be triggered in this emit cycle.`
          );
          break;
        }
        try {
          if (sync) {
            listener(payload, aborter);
          } else {
            await listener(payload, aborter);
          }
        } catch (error) {
          errors.push(error);
          console.error("trigger listener in emit event occured an error.", error);
          if (abortWhenErrorOccured) {
            break;
          }
        }
        index += 1;
      }
      if (errors.length > 0) {
        throw onlyThrowFirstError ? errors.at(0) : errors;
      }
    };
    return run();
  }
  /**
   * 获取已注册监听函数列表
   * @public
   */
  getRegisteredListeners() {
    return Array.from(this[ls]);
  }
  /**
   * 克隆出一个新的实例，并包含已注册的监听函数
   */
  clone() {
    const cloned = new _AtomEvent();
    Reflect.set(cloned, ls, new Set(Array.from(this[ls])));
    return cloned;
  }
};
_a$1 = ls;
let AtomEvent = _AtomEvent;

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var _a;
const pm = Symbol();
const _AtomEventPool = class _AtomEventPool {
  constructor(eventNames) {
    __publicField(this, _a, /* @__PURE__ */ new Map());
    Reflect.set(this, pm, new Map(eventNames.map((e) => [e, new AtomEvent()])));
  }
  /**
   * 添加某个事件名的监听函数
   * @public
   */
  on(e, listener, options) {
    const event = this.getEventPool().get(e);
    return event.on(listener, options);
  }
  /**
   * 添加某个事件名的监听函数。只执行一次
   * @public
   */
  once(e, listener, options) {
    const event = this.getEventPool().get(e);
    return event.once(listener, options);
  }
  /**
   * 移除某个事件名指定的监听函数
   * @public
   */
  off(e, listener) {
    const event = this.getEventPool().get(e);
    return event.off(listener);
  }
  /**
   * 移除某个事件名所有的监听函数
   * @public
   */
  clear(e) {
    const event = this.getEventPool().get(e);
    return event.clear();
  }
  /**
   * 移除所有监听事件
   * @public
   */
  clearAll() {
    return Object.values(this.getEventPool()).every((e) => e.clear());
  }
  /**
   * 触发某个事件名所有监听函数
   * @public
   */
  emit(e, payload, options) {
    const event = this.getEventPool().get(e);
    return event.emit(payload, options);
  }
  /**
   * 获取原子事件Map
   * @public
   */
  getEventPool() {
    return this[pm];
  }
  /**
   * 获取注册的事件名列表
   * @public
   */
  getEventNames() {
    return Array.from(this.getEventPool().keys());
  }
  /**
   * 克隆出一个新实例
   * @param disableInheritListeners - 是否不继承已有的监听函数
   * @public
   */
  clone(disableInheritListeners) {
    const newPool = new Map(Array.from(this.getEventPool().entries()).map(([e, ae]) => [e, disableInheritListeners ? new AtomEvent() : ae.clone()]));
    const cloned = new _AtomEventPool([]);
    Reflect.set(cloned, pm, newPool);
    return cloned;
  }
  /**
   * 增加事件名，返回一个新的事件池
   *
   * NOTE 派生出一个新实例
   *
   * @param disableInheritListeners - 是否不继承已有监听函数
   * @public
   */
  extend(eventNames, disableInheritListeners) {
    const cloned = this.clone(disableInheritListeners);
    eventNames.forEach((k) => {
      cloned[pm].set(k, new AtomEvent());
    });
    return cloned;
  }
  /**
   * 联合另一个事件池并返回一个新的事件池
   *
   * NOTE 派生出一个新实例
   *
   * @param disableInheritListeners - 是否不继承已有监听函数
   * @public
   */
  union(ep, disableInheritListeners) {
    const clonedThis = this.clone(disableInheritListeners);
    const clonedInput = ep.clone(disableInheritListeners);
    Array.from(clonedInput.getEventPool().entries()).forEach(([k, ae]) => {
      clonedThis.getEventPool().set(k, ae);
    });
    return clonedThis;
  }
};
_a = pm;
let AtomEventPool = _AtomEventPool;

export { AtomEvent, AtomEventPool };
