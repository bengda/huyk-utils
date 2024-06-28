// written by huyongkang
import { cloneData } from "./helper";

const im_s_m = Symbol();

export type ImmutableStoreMap = Record<string, any>;
export type ShallowMerge<T, U> = Omit<T, keyof U> & U;

/**
 * 不可变数据
 *
 * NOTE 可能会触发"类型实例化过深，且可能无限。ts(2589)"错误。使用ts目前不可能实现无限扩展字段的功能
 * @example
 * ```ts
 * const imut1 = ImmutableStore.create({ foo: '' });
const imut2 = imut1.extend({ bar: false });
const imut3 = imut2
  .imut('foo', 'hello')
  .imuts({ foo: 'hh', bar: true })
  .extend({ bar: [1] })
  .set('foo', 'world');

imut3.query('foo');
imut2.valueOf();
imut3
  .extend({ bar: ['1'] })
  .valueOf().bar;
 * ```
 */
export default class ImmutableStore<S extends ImmutableStoreMap = {}> {
  static create<SS extends ImmutableStoreMap = {}>(
    store?: SS,
  ) {
    const n = new ImmutableStore<SS>();

    if (store) {
      Reflect.set(n, im_s_m, cloneData(store));
    }

    return n;
  }

  declare [im_s_m]: S;

  private constructor() {
    Reflect.set(this, im_s_m, {});
  }

  extend<U extends ImmutableStoreMap>(extens: U) {
    return ImmutableStore.create<ShallowMerge<S, U>>(
      Object.assign({}, this[im_s_m], extens),
    );
  }

  set<K extends keyof S>(k: K, v: S[K]) {
    const keys = Object.keys(this[im_s_m]);

    if (!keys.includes(k as string)) return this;

    Reflect.set(this[im_s_m], k, v);

    return this;
  }

  query<T extends keyof S>(k: T) {
    return this[im_s_m][k];
  }

  clone() {
    return ImmutableStore.create<S>(this[im_s_m]);
  }

  imut<K extends keyof S>(k: K, v: S[K]) {
    return ImmutableStore.create<S>(
      Object.assign({}, this[im_s_m], { [k]: v }),
    );
  }

  imuts(kv: Partial<S>) {
    return ImmutableStore.create<S>(
      Object.assign({}, this[im_s_m], kv),
    );
  }

  valueOf() {
    return Object.assign({}, this[im_s_m]);
  }
}

// SECTION - ts definition test
// const imut1 = ImmutableStore.create({ foo: '' });
// const imut2 = imut1.extend({ bar: false });
// const imut3 = imut2
//   .imut('foo', 'hello')
//   .imuts({ foo: 'hh', bar: true })
//   .extend({ bar: [1] })
//   .extend({ p1: 1 })
//   .extend({ p2: 1 })
//   .extend({ p3: 1 })
//   .extend({ p4: 1 })
//   .extend({ p5: 1 })
//   .extend({ p6: 1 })
//   .set('foo', 'world');

// imut3.query('foo');
// imut2.valueOf();
// imut3
//   .extend({ bar: ['1'] })
//   .valueOf().bar;
// // !SECTION
