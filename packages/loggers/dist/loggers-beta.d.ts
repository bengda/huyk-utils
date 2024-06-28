import { ImmutableStore } from '@huyk-utils/utils';

/**
 * 基础的日志逻辑类
 */
export declare class BaseLogger<LogLevel extends string, AliasLogLevel extends LogLevel = LogLevel> {
    [kv_m]: ImmutableStore<LoggerKV<LogLevel, AliasLogLevel>>;
    from<T extends BaseLogger<string, string>>(source: T): this;
    clone(): BaseLogger<LogLevel, AliasLogLevel>;
    datetimeFormat(datetimeFormat: string): this;
    timeFormat(timeFormat: string): this;
    prefix(prefix: string[]): this;
    prependPrefix(...prefix: string[]): this;
    appendPrefix(...prefix: string[]): this;
    enable(enable: boolean): this;
    messageReceiver(messageReceiver: LoggerKV<LogLevel, AliasLogLevel>['messageReceiver']): this;
    label(label?: string): this;
    query<K extends keyof LoggerKV<LogLevel, AliasLogLevel>>(k: K): LoggerKV<LogLevel, AliasLogLevel>[K];
    print(params: Pick<PrintParams<LogLevel, AliasLogLevel>, 'level' | 'message' | 'raw'> & {
        aliasLevel?: AliasLogLevel;
    }): void;
}

declare const kv_m: unique symbol;

declare interface LoggerKV<LogLevel, AliasLogLevel extends LogLevel = LogLevel> {
    datetimeFormat: string;
    timeFormat: string;
    prefix: string[];
    enable: boolean;
    label?: string;
    messageReceiver(params: PrintParams<LogLevel, AliasLogLevel> & {
        datetime: string;
        time: string;
    }): any;
}

declare type PrintParams<LogLevel, AliasLogLevel extends LogLevel = LogLevel> = {
    level: LogLevel;
    aliasLevel: AliasLogLevel;
    prefix: string[];
    label: string;
    message: any[];
    filteredMessage: any[];
    excludedMessage: any[];
    /**
     * 如果设为`true`，则不进行格式转换
     */
    raw?: boolean;
};

export declare class WebConsole extends BaseLogger<keyof Console> {
    constructor();
    clone(): WebConsole;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/assert) */
    assert(condition?: boolean, ...data: any[]): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/clear) */
    clear(): this;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/count) */
    count(label?: string): this;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/countReset) */
    countReset(label?: string): this;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/debug) */
    debug(...data: any[]): this;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/dir) */
    dir(item?: any, options?: any): this;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/error) */
    error(...data: any[]): this;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/group) */
    group(...data: any[]): this;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/groupCollapsed) */
    groupCollapsed(...data: any[]): this;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/groupEnd) */
    groupEnd(): this;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/info) */
    info(...data: any[]): this;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/log) */
    log(...data: any[]): this;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/table) */
    table(tabularData?: any, properties?: string[]): this;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/time) */
    time(label?: string): this;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/timeEnd) */
    timeEnd(label?: string): this;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/timeLog) */
    timeLog(label?: string, ...data: any[]): this;
    timeStamp(label?: string): this;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/trace) */
    trace(...data: any[]): this;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/warn) */
    warn(...data: any[]): this;
}

export { }
