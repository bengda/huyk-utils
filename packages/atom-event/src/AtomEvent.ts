// written by huyongkang

export type AtomEventCanceler = () => boolean;
export type AtomEventListenerOptions = {
  /**
   * 排序，序号越小越先执行
   *
   * @default 999
   */
  order?: number;
  /**
   * 只触发一次，等同于`once`方法
   */
  once?: boolean;
};
export type AtomEventListenerOnceOptions = Omit<AtomEventListenerOptions, 'once'>;
export type AtomEventEmitOptions = {
  /**
   * 同步触发所有监听的handlers，如果有异步handler，abort函数可能不会达到预期效果
   * @default false
   */
  sync?: boolean;
  /**
   * 捕获到了执行监听函数时的错误，则中断执行尚未执行的监听函数
   * @default false
   */
  abortWhenErrorOccured?: boolean;
  /**
   * 只抛出第一个捕获到的错误，这样一般是为了方便显示错误提示信息
   * @default true
   */
  onlyThrowFirstError?: boolean;
};
export type AtomEventListener<T> = {
  (
    payload: T,
    /**
     * 停止触发后面的监听事件
     */
    abort: (reason?: string) => void,
  ): void | Promise<void>;
  __atom_event__options__?: AtomEventListenerOptions;
  __atom_event__target__?: any;
};

const ls = Symbol();

function sortSets<T>(sets: Set<AtomEventListener<T>>) {
  const list = Array.from(sets).sort(
    (a, b) => a.__atom_event__options__?.order! - b.__atom_event__options__?.order!,
  );

  sets.clear();
  list.forEach(handler => sets.add(handler));

  return sets;
}

function add2Sets<T>(sets: Set<AtomEventListener<T>>, listener: AtomEventListener<T>) {
  sets.add(listener);

  sortSets(sets);
}

function removeFromSets<T>(sets: Set<AtomEventListener<T>>, listener: AtomEventListener<T>) {
  Reflect.deleteProperty(listener, '__atom_event__options__');

  return sets.delete(listener);
}

function clearSets<T>(sets: Set<AtomEventListener<T>>) {
  Array.from(sets).forEach((listener) => {
    Reflect.deleteProperty(listener, '__atom_event__options__');
    Reflect.deleteProperty(listener, '__atom_event__target__');
  });

  return sets.clear();
}

/**
 * 单原子事件管理器
 * @example
 * ```ts
 * const e = AtomEvent<number>();
 * const listener: AtomEventListener<number> = (n) => { console.info(n) };
 * e.on(listener);
 * e.emit(1024);
 * e.off(listener);
 * ```
 */
export default class AtomEvent<T> {
  [ls] = new Set<AtomEventListener<T>>();

  /**
   * 移除某个事件监听
   * @public
   */
  off(listener: AtomEventListener<T>) {
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
  on(listener: AtomEventListener<T>, options?: AtomEventListenerOptions): AtomEventCanceler {
    if (typeof listener !== 'function') {
      return () => true;
    }

    if (options?.once) {
      return this.once(listener, Object.assign({}, options, { once: false }));
    }

    listener.__atom_event__options__ = { order: 999, ...(options || {}) };
    add2Sets(this[ls], listener);

    return () => this.off(listener);
  }

  /**
   * 注册一个只执行一次的事件
   * @public
   */
  once(listener: AtomEventListener<T>, options?: AtomEventListenerOnceOptions): AtomEventCanceler {
    if (typeof listener !== 'function') {
      return () => true;
    }

    const handler: AtomEventListener<T> = listener.__atom_event__target__
      || ((...params) => {
        this.off(handler);

        Reflect.deleteProperty(listener, '__atom_event__target__');

        listener?.(...params);
      });

    listener.__atom_event__target__ = handler;

    return this.on(handler, options);
  }

  /**
   * 触发所有已注册的事件
   * @public
   */
  emit(payload: T, options?: AtomEventEmitOptions): Promise<void> {
    const {
      sync = false,
      abortWhenErrorOccured = false,
      onlyThrowFirstError = true,
    } = options || {};

    let abortFlag = false;
    let abortReason = '';
    const aborter = (reason?: string) => {
      abortFlag = true;
      abortReason = reason || '';
    };

    const list = Array.from(this[ls]);
    const errors: any[] = [];
    let index = 0;

    const run = async () => {
      for (const listener of list) {
        if (abortFlag) {
          console.warn(
            `received abort flag${abortReason ? ` of reason: ${abortReason}` : ''}, left ${
              list.length - index
            } listeners will not be triggered in this emit cycle.`,
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
          console.error('trigger listener in emit event occured an error.', error);

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
    const cloned = new AtomEvent<T>();
    Reflect.set(cloned, ls, new Set(Array.from(this[ls])));

    return cloned;
  }
}
