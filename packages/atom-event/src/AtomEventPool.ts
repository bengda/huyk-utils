// written by huyongkang
import AtomEvent, {
  type AtomEventListener,
  type AtomEventListenerOptions,
  type AtomEventEmitOptions,
  type AtomEventListenerOnceOptions,
} from './AtomEvent';

const pm = Symbol();

/**
 * 事件管理池
 * @example
 * ```ts
 * const ep = new AtomEventPool<{
 *   change: number;
 *   success: undefined;
 * }>(['change', 'success']);
 * ep.on('change', (payload) => {
 *   console.info(payload);
 * });
 *
 * ep.on('success', (payload) => {
 *  console.info(payload);
 * });
 *
 * const clonedEp = ep.clone();
 *
 * clonedEp.on('change', (payload) => {
 *   console.info(payload);
 * });
 *
 * clonedEp.on('success', (payload) => {
 *   console.info(payload);
 * });
 *
 * clonedEp.clear('change');
 * clonedEp.off('success', () => {});
 *
 * const extended = clonedEp.extend<{ visible: boolean }>(['visible']);
 *
 * extended.on('change', (payload) => {
 *   console.info(payload);
 * });
 *
 * extended.on('success', (payload) => {
 *  console.info(payload);
 * });
 *
 * extended.once('visible', (payload) => {
 *   console.info(payload);
 * });
 *
 * const unioned = extended.union(new AtomEventPool<{
 *   error: Error;
 * }>(['error']));
 *
 * unioned.on('change', (payload) => {
 *   console.info(payload);
 * });
 *
 * unioned.on('success', (payload) => {
 *   console.info(payload);
 * });
 *
 * unioned.once('visible', (payload) => {
 *   console.info(payload);
 * });
 *
 * unioned.on('error', (err) => {
 *   console.info(err);
 * });
 * ```
 */
export default class AtomEventPool<P extends Record<string, unknown>> {
  [pm] = new Map<keyof P, AtomEvent<unknown>>();

  constructor(eventNames: Array<keyof P>) {
    Reflect.set(this, pm, new Map(eventNames.map(e => [e, new AtomEvent()])));
  }

  /**
   * 添加某个事件名的监听函数
   * @public
   */
  on<E extends keyof P, T extends P[E]>(e: E, listener: AtomEventListener<T>, options?: AtomEventListenerOptions) {
    const event = this.getEventPool().get(e) as AtomEvent<T>;

    return event.on(listener, options);
  }

  /**
   * 添加某个事件名的监听函数。只执行一次
   * @public
   */
  once<E extends keyof P, T extends P[E]>(e: E, listener: AtomEventListener<T>, options?: AtomEventListenerOnceOptions) {
    const event = this.getEventPool().get(e) as AtomEvent<T>;

    return event.once(listener, options);
  }

  /**
   * 移除某个事件名指定的监听函数
   * @public
   */
  off<E extends keyof P, T extends P[E]>(e: E, listener: AtomEventListener<T>) {
    const event = this.getEventPool().get(e) as AtomEvent<T>;

    return event.off(listener);
  }

  /**
   * 移除某个事件名所有的监听函数
   * @public
   */
  clear<E extends keyof P, T extends P[E]>(e: E) {
    const event = this.getEventPool().get(e) as AtomEvent<T>;

    return event.clear();
  }

  /**
   * 移除所有监听事件
   * @public
   */
  clearAll() {
    return Object.values(this.getEventPool()).every(e => e.clear());
  }

  /**
   * 触发某个事件名所有监听函数
   * @public
   */
  emit<E extends keyof P, T extends P[E]>(e: E, payload: T, options?: AtomEventEmitOptions) {
    const event = this.getEventPool().get(e) as AtomEvent<T>;

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
  clone(disableInheritListeners?: boolean) {
    const newPool = new Map(Array.from(this.getEventPool().entries()).map(([e, ae]) => [e, disableInheritListeners ? new AtomEvent() : ae.clone()]));
    const cloned = new AtomEventPool<P>([]);

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
  extend<T extends Record<string, unknown>>(eventNames: Array<keyof T>, disableInheritListeners?: boolean): AtomEventPool<P & T> {
    const cloned = this.clone(disableInheritListeners);

    eventNames.forEach((k) => {
      cloned[pm].set(k as any, new AtomEvent());
    });

    return cloned as AtomEventPool<P & T>;
  }

  /**
   * 联合另一个事件池并返回一个新的事件池
   *
   * NOTE 派生出一个新实例
   *
   * @param disableInheritListeners - 是否不继承已有监听函数
   * @public
   */
  union<T extends Record<string, unknown>>(ep: AtomEventPool<T>, disableInheritListeners?: boolean) {
    const clonedThis = this.clone(disableInheritListeners);
    const clonedInput = ep.clone(disableInheritListeners);

    Array.from(clonedInput.getEventPool().entries()).forEach(([k, ae]) => {
      clonedThis.getEventPool().set(k as any, ae);
    });

    return clonedThis as AtomEventPool<P & T>;
  }
}

// ts test
// const ep = new AtomEventPool<{
//   change: number;
//   success: undefined;
// }>(['change', 'success']);
// ep.on('change', (payload) => {
//   console.info(payload);
// });

// ep.on('success', (payload) => {
//   console.info(payload);
// });

// const clonedEp = ep.clone();

// clonedEp.on('change', (payload) => {
//   console.info(payload);
// });

// clonedEp.on('success', (payload) => {
//   console.info(payload);
// });

// clonedEp.clear('change');
// clonedEp.off('success', () => {});

// const extended = clonedEp.extend<{ visible: boolean }>(['visible']);

// extended.on('change', (payload) => {
//   console.info(payload);
// });

// extended.on('success', (payload) => {
//   console.info(payload);
// });

// extended.once('visible', (payload) => {
//   console.info(payload);
// });

// const unioned = extended.union(new AtomEventPool<{
//   error: Error;
// }>(['error']));

// unioned.on('change', (payload) => {
//   console.info(payload);
// });

// unioned.on('success', (payload) => {
//   console.info(payload);
// });

// unioned.once('visible', (payload) => {
//   console.info(payload);
// });

// unioned.on('error', (err) => {
//   console.info(err);
// });
