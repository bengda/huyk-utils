import dayjs from 'dayjs';
import { ImmutableStore, formatString } from '@huyk-utils/utils';

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var _a;
const IgnoreStartTag = "<ignore>";
const IgnoreEndTag = "</ignore>";
const formatInputArgs = (args, mapData) => args.map((item) => typeof item === "string" ? formatString(item, mapData) : item);
const filterIgnoreTag = (msg) => msg.filter((item) => ![IgnoreStartTag, IgnoreEndTag].includes(item));
const excludeIgnoredMsgs = (msgs) => {
  let ignoreFlag = false;
  const filterd = [];
  msgs.forEach((item) => {
    if (item === IgnoreStartTag) {
      ignoreFlag = true;
    } else if (item === IgnoreEndTag) {
      ignoreFlag = false;
    } else if (!ignoreFlag) {
      filterd.push(item);
    }
  });
  return filterd;
};
const kv_m = Symbol();
const _BaseLogger = class _BaseLogger {
  constructor() {
    __publicField(this, _a, ImmutableStore.create({
      label: "BaseLogger",
      datetimeFormat: "YYYY-MM-DD HH:mm:ss",
      timeFormat: "HH:mm:ss",
      prefix: ["{time}", "{level}", "[{label}]"],
      enable: true,
      messageReceiver() {
      }
    }));
  }
  from(source) {
    this[kv_m] = source[kv_m].clone();
    return this;
  }
  clone() {
    return new _BaseLogger().from(this);
  }
  datetimeFormat(datetimeFormat) {
    this[kv_m].set("datetimeFormat", datetimeFormat);
    return this;
  }
  timeFormat(timeFormat) {
    this[kv_m].set("timeFormat", timeFormat);
    return this;
  }
  prefix(prefix) {
    this[kv_m].set("prefix", prefix);
    return this;
  }
  prependPrefix(...prefix) {
    this[kv_m].query("prefix").unshift(...prefix);
    return this;
  }
  appendPrefix(...prefix) {
    this[kv_m].query("prefix").push(...prefix);
    return this;
  }
  enable(enable) {
    this[kv_m].set("enable", enable);
    return this;
  }
  messageReceiver(messageReceiver) {
    this[kv_m].set("messageReceiver", messageReceiver);
    return this;
  }
  label(label) {
    this[kv_m].set("label", label);
    return this;
  }
  query(k) {
    return this[kv_m].query(k);
  }
  print(params) {
    if (!this.query("enable"))
      return;
    const inputMessages = params.message;
    const d = dayjs();
    const datetime = d.format(this.query("datetimeFormat"));
    const time = d.format(this.query("timeFormat"));
    const prefix = this.query("prefix");
    const label = this.query("label") || "Anonymous";
    const formatargs = {
      datetime,
      time,
      level: params.level,
      label
    };
    const messages = params.raw ? inputMessages : formatInputArgs(inputMessages, formatargs);
    try {
      this.query("messageReceiver")?.call(this, {
        level: params.level,
        // @ts-ignore
        aliasLevel: params.aliasLevel || params.level,
        prefix: params.raw ? prefix : formatInputArgs(prefix, formatargs),
        label,
        datetime,
        time,
        message: messages,
        filteredMessage: filterIgnoreTag(messages),
        excludedMessage: excludeIgnoredMsgs(messages),
        raw: !!params.raw
      });
    } catch (error) {
      console.error(error, `call messageReceiver in "${label}" has an error.`);
    }
  }
};
_a = kv_m;
let BaseLogger = _BaseLogger;

class WebConsole extends BaseLogger {
  constructor() {
    super();
    this.label("WebConsole");
    this.messageReceiver((param) => {
      console[param.level](...param.prefix, ...param.filteredMessage);
    });
  }
  clone() {
    return new WebConsole().from(this);
  }
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/assert) */
  assert(condition, ...data) {
    return console.assert(condition, ...data);
  }
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/clear) */
  clear() {
    this.print({ level: "clear", message: [] });
    return this;
  }
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/count) */
  count(label) {
    console.count(label);
    return this;
  }
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/countReset) */
  countReset(label) {
    console.countReset(label);
    return this;
  }
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/debug) */
  debug(...data) {
    this.print({ level: "debug", message: data });
    return this;
  }
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/dir) */
  dir(item, options) {
    console.dir(item, options);
    return this;
  }
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/error) */
  error(...data) {
    this.print({ level: "error", message: data });
    return this;
  }
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/group) */
  group(...data) {
    this.print({ level: "group", message: data });
    return this;
  }
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/groupCollapsed) */
  groupCollapsed(...data) {
    this.print({ level: "groupCollapsed", message: data });
    return this;
  }
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/groupEnd) */
  groupEnd() {
    console.groupEnd();
    return this;
  }
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/info) */
  info(...data) {
    this.print({ level: "info", message: data });
    return this;
  }
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/log) */
  log(...data) {
    this.print({ level: "log", message: data });
    return this;
  }
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/table) */
  table(tabularData, properties) {
    console.table(tabularData, properties);
    return this;
  }
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/time) */
  time(label) {
    console.time(label);
    return this;
  }
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/timeEnd) */
  timeEnd(label) {
    console.timeEnd(label);
    return this;
  }
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/timeLog) */
  timeLog(label, ...data) {
    console.timeLog(label, ...data);
    return this;
  }
  timeStamp(label) {
    console.timeStamp(label);
    return this;
  }
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/trace) */
  trace(...data) {
    console.trace(...data);
    return this;
  }
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/warn) */
  warn(...data) {
    this.print({ level: "warn", message: data });
    return this;
  }
}

export { BaseLogger, WebConsole };
