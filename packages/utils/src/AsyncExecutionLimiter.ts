// written by huyongkang

const AccProperty = Symbol('acc');
const BlocksProperty = Symbol('blocks');

/**
 * 异步并发控制器
 */
export default class AsyncExecutionLimiter {
  /**
   * @public
   */
  limit = 1;

  /**
   * @public
   */
  race = true;

  constructor(params?: {
    /**
     * 并发数
     */
    limit?: number;
    /**
     * 是否使用竞态模式，如果当前操作完成了，那么跳过中间的阻塞任务（相当于会永远处于`pending`状态），直接执行最后一个任务
     */
    race?: boolean;
  }) {
    if (params) {
      if (Reflect.has(params, 'limit')) {
        this.limit = params.limit as number;
      }

      if (Reflect.has(params, 'race')) {
        this.race = params.race as boolean;
      }
    }

    Reflect.set(this, AccProperty, 0);
    Reflect.set(this, BlocksProperty, []);
  }

  _acc() {
    return Reflect.get(this, AccProperty) as number;
  }

  _blocks() {
    return Reflect.get(this, BlocksProperty) as Array<(...args: any) => any>;
  }

  /**
   * @public
   */
  async run<T extends (...args: any) => any>(fn: T): Promise<Awaited<ReturnType<T>>> {
    if (!fn) {
      throw new Error('fn is required.');
    }
    if (Object.prototype.toString.call(fn) !== '[object Function]') {
      throw new Error('fn must be a function.');
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
          // 直接取最后一条数据，中间阻塞任务跳过（相当于会永远处于`pending`状态）
          blocks.pop()?.();
          blocks.length = 0;
        } else {
          // 取第一条数据执行
          blocks.shift()?.();
        }
      }
    }
  }
}
