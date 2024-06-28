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
export declare class AtomEvent<T> {
    [ls]: Set<AtomEventListener<T>>;
    /**
     * 移除某个事件监听
     * @public
     */
    off(listener: AtomEventListener<T>): boolean;
    /**
     * 清除所有事件监听
     * @public
     */
    clear(): void;
    /**
     * 注册一个事件监听
     * @public
     */
    on(listener: AtomEventListener<T>, options?: AtomEventListenerOptions): AtomEventCanceler;
    /**
     * 注册一个只执行一次的事件
     * @public
     */
    once(listener: AtomEventListener<T>, options?: AtomEventListenerOnceOptions): AtomEventCanceler;
    /**
     * 触发所有已注册的事件
     * @public
     */
    emit(payload: T, options?: AtomEventEmitOptions): Promise<void>;
    /**
     * 获取已注册监听函数列表
     * @public
     */
    getRegisteredListeners(): AtomEventListener<T>[];
    /**
     * 克隆出一个新的实例，并包含已注册的监听函数
     */
    clone(): AtomEvent<T>;
}

export declare type AtomEventCanceler = () => boolean;

export declare type AtomEventEmitOptions = {
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

export declare type AtomEventListener<T> = {
    (payload: T, 
    /**
     * 停止触发后面的监听事件
     */
    abort: (reason?: string) => void): void | Promise<void>;
    __atom_event__options__?: AtomEventListenerOptions;
    __atom_event__target__?: any;
};

export declare type AtomEventListenerOnceOptions = Omit<AtomEventListenerOptions, 'once'>;

export declare type AtomEventListenerOptions = {
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
export declare class AtomEventPool<P extends Record<string, unknown>> {
    [pm]: Map<keyof P, AtomEvent<unknown>>;
    constructor(eventNames: Array<keyof P>);
    /**
     * 添加某个事件名的监听函数
     * @public
     */
    on<E extends keyof P, T extends P[E]>(e: E, listener: AtomEventListener<T>, options?: AtomEventListenerOptions): AtomEventCanceler;
    /**
     * 添加某个事件名的监听函数。只执行一次
     * @public
     */
    once<E extends keyof P, T extends P[E]>(e: E, listener: AtomEventListener<T>, options?: AtomEventListenerOnceOptions): AtomEventCanceler;
    /**
     * 移除某个事件名指定的监听函数
     * @public
     */
    off<E extends keyof P, T extends P[E]>(e: E, listener: AtomEventListener<T>): boolean;
    /**
     * 移除某个事件名所有的监听函数
     * @public
     */
    clear<E extends keyof P, T extends P[E]>(e: E): void;
    /**
     * 移除所有监听事件
     * @public
     */
    clearAll(): boolean;
    /**
     * 触发某个事件名所有监听函数
     * @public
     */
    emit<E extends keyof P, T extends P[E]>(e: E, payload: T, options?: AtomEventEmitOptions): Promise<void>;
    /**
     * 获取原子事件Map
     * @public
     */
    getEventPool(): Map<keyof P, AtomEvent<unknown>>;
    /**
     * 获取注册的事件名列表
     * @public
     */
    getEventNames(): (keyof P)[];
    /**
     * 克隆出一个新实例
     * @param disableInheritListeners - 是否不继承已有的监听函数
     * @public
     */
    clone(disableInheritListeners?: boolean): AtomEventPool<P>;
    /**
     * 增加事件名，返回一个新的事件池
     *
     * NOTE 派生出一个新实例
     *
     * @param disableInheritListeners - 是否不继承已有监听函数
     * @public
     */
    extend<T extends Record<string, unknown>>(eventNames: Array<keyof T>, disableInheritListeners?: boolean): AtomEventPool<P & T>;
    /**
     * 联合另一个事件池并返回一个新的事件池
     *
     * NOTE 派生出一个新实例
     *
     * @param disableInheritListeners - 是否不继承已有监听函数
     * @public
     */
    union<T extends Record<string, unknown>>(ep: AtomEventPool<T>, disableInheritListeners?: boolean): AtomEventPool<P & T>;
}

declare const ls: unique symbol;

declare const pm: unique symbol;

export { }
