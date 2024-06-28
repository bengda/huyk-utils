<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@huyk-utils/utils](./utils.md) &gt; [extendUrl](./utils.extendurl.md)

## extendUrl() function

扩展url

**Signature:**

```typescript
declare function extendUrl(url: string, options?: {
    position: 'search' | 'hash';
    query?: Record<string, string | number>;
    remove?: (string | RegExp)[];
    encode?: boolean;
}): string;
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

url


</td><td>

string


</td><td>


</td></tr>
<tr><td>

options


</td><td>

{ position: 'search' \| 'hash'; query?: Record&lt;string, string \| number&gt;; remove?: (string \| RegExp)\[\]; encode?: boolean; }


</td><td>

_(Optional)_


</td></tr>
</tbody></table>
**Returns:**

string

## Example

extendUrl('xxx.com?a=1&amp;b=2', { query: { b: 3, c: 4 }<!-- -->, remove: \['a'\], position: 'search' }<!-- -->) // 返回 xxx.com?b=3&amp;c=4 extendUrl('xxx.com?a=1&amp;b=2\#/a=1', { query: { b: 3, c: 4 }<!-- -->, remove: \['a'\], position: 'hash' }<!-- -->) // 返回 xxx.com?a=1&amp;b=2\#/a=1?b=3&amp;c=4
