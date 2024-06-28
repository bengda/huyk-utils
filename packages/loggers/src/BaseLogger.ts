// written by huyongkang

import dayjs from 'dayjs';
import { formatString, ImmutableStore } from '@huyk-utils/utils';

const IgnoreStartTag = '<ignore>';
const IgnoreEndTag = '</ignore>';

const formatInputArgs = (args: any[], mapData: Record<string, any>) => args
  .map(item => (typeof item === 'string' ? formatString(item, mapData) : item));

export const filterIgnoreTag = (msg: any[]) => msg
  .filter((item: any) => ![IgnoreStartTag, IgnoreEndTag].includes(item));

export const excludeIgnoredMsgs = (msgs: any[]) => {
  let ignoreFlag = false;
  const filterd: any[] = [];

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

type PrintParams<LogLevel, AliasLogLevel extends LogLevel = LogLevel> = {
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

const kv_m = Symbol();

interface LoggerKV<LogLevel, AliasLogLevel extends LogLevel = LogLevel> {
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

/**
 * 基础的日志逻辑类
 */
export default class BaseLogger<LogLevel extends string, AliasLogLevel extends LogLevel = LogLevel> {
  [kv_m] = ImmutableStore.create<LoggerKV<LogLevel, AliasLogLevel>>({
    label: 'BaseLogger',
    datetimeFormat: 'YYYY-MM-DD HH:mm:ss',
    timeFormat: 'HH:mm:ss',
    prefix: ['{time}', '{level}', '[{label}]'],
    enable: true,
    messageReceiver() {},
  });

  from<T extends BaseLogger<string, string>>(source: T) {
    this[kv_m] = source[kv_m].clone();

    return this;
  }

  clone(): BaseLogger<LogLevel, AliasLogLevel> {
    return new BaseLogger<LogLevel, AliasLogLevel>().from(this);
  }

  datetimeFormat(datetimeFormat: string) {
    this[kv_m].set('datetimeFormat', datetimeFormat);

    return this;
  }

  timeFormat(timeFormat: string) {
    this[kv_m].set('timeFormat', timeFormat);

    return this;
  }

  prefix(prefix: string[]) {
    this[kv_m].set('prefix', prefix);

    return this;
  }

  prependPrefix(...prefix: string[]) {
    this[kv_m].query('prefix').unshift(...prefix);

    return this;
  }

  appendPrefix(...prefix: string[]) {
    this[kv_m].query('prefix').push(...prefix);

    return this;
  }

  enable(enable: boolean) {
    this[kv_m].set('enable', enable);

    return this;
  }

  messageReceiver(messageReceiver: LoggerKV<LogLevel, AliasLogLevel>['messageReceiver']) {
    this[kv_m].set('messageReceiver', messageReceiver);

    return this;
  }

  label(label?: string) {
    this[kv_m].set('label', label);

    return this;
  }

  query<K extends keyof LoggerKV<LogLevel, AliasLogLevel>>(k: K) {
    return this[kv_m].query(k);
  }

  print(params: Pick<PrintParams<LogLevel, AliasLogLevel>, 'level' | 'message' | 'raw'> & { aliasLevel?: AliasLogLevel }): void {
    if (!this.query('enable')) return;

    const inputMessages = params.message;
    const d = dayjs();
    const datetime = d.format(this.query('datetimeFormat'));
    const time = d.format(this.query('timeFormat'));
    const prefix = this.query('prefix');
    const label = this.query('label') || 'Anonymous';
    const formatargs = {
      datetime,
      time,
      level: params.level,
      label,
    };
    const messages = params.raw
      ? inputMessages
      : formatInputArgs(inputMessages, formatargs);

    try {
      this.query('messageReceiver')?.call(this, {
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
        raw: !!params.raw,
      });
    } catch (error) {
      console.error(error, `call messageReceiver in "${label}" has an error.`);
    }
  }
}
