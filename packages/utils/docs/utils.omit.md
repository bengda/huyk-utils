<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@huyk-utils/utils](./utils.md) &gt; [omit](./utils.omit.md)

## omit() function

将一个对象指定属性排除，并生成一个新的对象

**Signature:**

```typescript
declare function omit<T extends object, K extends keyof T>(obj: T, fields: readonly K[]): Omit<T, (typeof fields)[number]>;
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

obj


</td><td>

T


</td><td>

目标对象


</td></tr>
<tr><td>

fields


</td><td>

readonly K\[\]


</td><td>

要排除的属性列表


</td></tr>
</tbody></table>
**Returns:**

Omit&lt;T, (typeof fields)\[number\]&gt;
