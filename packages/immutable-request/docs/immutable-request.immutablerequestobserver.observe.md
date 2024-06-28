<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@huyk-utils/immutable-request](./immutable-request.md) &gt; [ImmutableRequestObserver](./immutable-request.immutablerequestobserver.md) &gt; [observe](./immutable-request.immutablerequestobserver.observe.md)

## ImmutableRequestObserver.observe() method

观察每个请求阶段的状态和数据

**Signature:**

```typescript
observe(effect: (params: {
        apiDef: RequestApi<D, R>;
        reqId: string;
        status: RequestObserverRequestStatus;
        parse<S extends RequestObserverRequestStatus>(status: S): S extends 'prepare' ? {
            data: D;
            options: RequestOptionsInput;
            reqId: string;
        } : (S extends 'pending' ? {
            reqId: string;
            data: D;
            options: RequestOptionsInput;
        } : (S extends 'resolved' ? {
            afterParse: (RP extends ((...args: any) => any) ? ReturnType<RP> : AugmentedResponseOutput<R>);
            response: AugmentedResponseOutput<R>;
            options: RequestOptionsInput;
        } : ({
            error: any;
            options: RequestOptionsInput;
        })));
    }) => any): _huyk_utils_atom_event.AtomEventCanceler;
```

## Parameters

<table><thead><tr><th>

Parameter


</th><th>

Type


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

effect


</td><td>

(params: { apiDef: [RequestApi](./immutable-request.requestapi.md)<!-- -->&lt;D, R&gt;; reqId: string; status: [RequestObserverRequestStatus](./immutable-request.requestobserverrequeststatus.md)<!-- -->; parse&lt;S extends [RequestObserverRequestStatus](./immutable-request.requestobserverrequeststatus.md)<!-- -->&gt;(status: S): S extends 'prepare' ? { data: D; options: [RequestOptionsInput](./immutable-request.requestoptionsinput.md)<!-- -->; reqId: string; } : (S extends 'pending' ? { reqId: string; data: D; options: [RequestOptionsInput](./immutable-request.requestoptionsinput.md)<!-- -->; } : (S extends 'resolved' ? { afterParse: (RP extends ((...args: any) =&gt; any) ? ReturnType&lt;RP&gt; : [AugmentedResponseOutput](./immutable-request.augmentedresponseoutput.md)<!-- -->&lt;R&gt;); response: [AugmentedResponseOutput](./immutable-request.augmentedresponseoutput.md)<!-- -->&lt;R&gt;; options: [RequestOptionsInput](./immutable-request.requestoptionsinput.md)<!-- -->; } : ({ error: any; options: [RequestOptionsInput](./immutable-request.requestoptionsinput.md)<!-- -->; }))); }) =&gt; any


</td><td>


</td></tr>
</tbody></table>
**Returns:**

\_huyk\_utils\_atom\_event.AtomEventCanceler
