// written by huyongkang
import BaseLogger from './BaseLogger';

export default class WebConsole extends BaseLogger<keyof Console> {
  constructor() {
    super();

    this.label('WebConsole');

    this.messageReceiver((param) => {
      // @ts-ignore
      console[param.level](...param.prefix, ...param.filteredMessage);
    });
  }

  clone() {
    return new WebConsole().from(this);
  }

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/assert) */
  assert(condition?: boolean, ...data: any[]) {
    return console.assert(condition, ...data);
  }

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/clear) */
  clear() {
    this.print({ level: 'clear', message: [] });

    return this;
  }

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/count) */
  count(label?: string) {
    console.count(label);

    return this;
  };

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/countReset) */
  countReset(label?: string) {
    console.countReset(label);

    return this;
  }

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/debug) */
  debug(...data: any[]) {
    this.print({ level: 'debug', message: data });

    return this;
  };

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/dir) */
  dir(item?: any, options?: any) {
    console.dir(item, options);

    return this;
  }

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/error) */
  error(...data: any[]) {
    this.print({ level: 'error', message: data });

    return this;
  }

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/group) */
  group(...data: any[]) {
    this.print({ level: 'group', message: data });

    return this;
  }

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/groupCollapsed) */
  groupCollapsed(...data: any[]) {
    this.print({ level: 'groupCollapsed', message: data });

    return this;
  }

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/groupEnd) */
  groupEnd() {
    console.groupEnd();

    return this;
  }

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/info) */
  info(...data: any[]) {
    this.print({ level: 'info', message: data });

    return this;
  }

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/log) */
  log(...data: any[]) {
    this.print({ level: 'log', message: data });

    return this;
  }

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/table) */
  table(tabularData?: any, properties?: string[]) {
    console.table(tabularData, properties);

    return this;
  }

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/time) */
  time(label?: string) {
    console.time(label);

    return this;
  }

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/timeEnd) */
  timeEnd(label?: string) {
    console.timeEnd(label);

    return this;
  }

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/timeLog) */
  timeLog(label?: string, ...data: any[]) {
    console.timeLog(label, ...data);

    return this;
  }

  timeStamp(label?: string) {
    console.timeStamp(label);

    return this;
  }

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/trace) */
  trace(...data: any[]) {
    console.trace(...data);

    return this;
  }

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/warn) */
  warn(...data: any[]) {
    this.print({ level: 'warn', message: data });

    return this;
  }
}
