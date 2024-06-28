<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@huyk-utils/utils](./utils.md) &gt; [isType](./utils.istype.md)

## isType() function

判断数据类型

**Signature:**

```typescript
declare function isType<T extends keyof DataTypeMapping>(input: any, type: T): input is DataTypeMapping[T];
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

input


</td><td>

any


</td><td>

输入数据


</td></tr>
<tr><td>

type


</td><td>

T


</td><td>

要比较的数据类型


</td></tr>
</tbody></table>
**Returns:**

input is [DataTypeMapping](./utils.datatypemapping.md)<!-- -->\[T\]

## Example


```ts
isType(1, 'number') // true
```
