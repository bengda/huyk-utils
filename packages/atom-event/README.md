An atom event manager. 

- tiny but powerful.
- no deps.
- types support.
 
## AtomEvent
```ts
import { AtomEvent, type AtomEventListener } from '@huyk-utils/atom-event';

const e = AtomEvent<number>();
const listener: AtomEventListener<number> = (n) => { console.info(n) };
e.on(listener);
e.emit(1024);
e.off(listener);
//
const e1 = AtomEvent<string>();

e1.on((payload) => {
  console.info('listener 1', payload);
}, { order: 2 });

e1.on((payload) => {
  console.info('listener 2', payload);
}, { order: 1 }); // listener2 is emited before listener1

e1.emit('foo');

const e3 = e2.clone(); // cloned a new instance, includes registered listeners.
e3.on((payload) => {
  console.info('listener 3', payload); // will not receive data from e2
});

e3.emit('bar'); // listener1 and listener2 will be emitted too.
e2.emit('bar');

e3.once((payload) => {
  console.info('run once.', payload);
});

// also
e3.on((payload) => {
  console.info('also run once.', payload);
}, { once: true });

const cancel = e3.on(() => {});
cancel(); // cancel the watch.

// also
const fn = () => {};
e3.on(fn);
e3.off(fn);
```

## AtomEventPool
 ```ts
 const ep = new AtomEventPool<{
   change: number;
   success: undefined;
 }>(['change', 'success']);
 ep.on('change', (payload) => {
   console.info(payload);
 });

 ep.on('success', (payload) => {
  console.info(payload);
 });

 const clonedEp = ep.clone();

 clonedEp.on('change', (payload) => {
   console.info(payload);
 });

 clonedEp.on('success', (payload) => {
   console.info(payload);
 });

 clonedEp.clear('change');
 clonedEp.off('success', () => {});

 const extended = clonedEp.extend<{ visible: boolean }>(['visible']);

 extended.on('change', (payload) => {
   console.info(payload);
 });

 extended.on('success', (payload) => {
  console.info(payload);
 });

 extended.once('visible', (payload) => {
   console.info(payload);
 });

 const unioned = extended.union(new AtomEventPool<{
   error: Error;
 }>(['error']));

 unioned.on('change', (payload) => {
   console.info(payload);
 });

 unioned.on('success', (payload) => {
   console.info(payload);
 });

 unioned.once('visible', (payload) => {
   console.info(payload);
 });

 unioned.on('error', (err) => {
   console.info(err);
 });
 ```