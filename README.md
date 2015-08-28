# lax
A data toolkit for lazy JavaScript programmers (and other people).

### Expressions
Lax expressions allow you to evaluate JavaScript expressions using an object as the source of the expression's local variables. Here's how you use then:

```js
var barLength = lax.expr("bar.length");
barLength({bar: "Hello"}) // 5
```

**Note: expressions in lax are evaluated using `eval()`, which is prohibited in [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode).**

Remember that a string passed to `lax.expr()` will always be evaluated as JavaScript, so:

```js
typeof lax.expr("1")() === "number"
```

Also, keys that can't be expressed as JavaScript variables won't be evaluated in your expression:

```
var d = {'foo bar': 10};
lax.expr("foo bar > 10")(d);  // syntax error
lax.expr("foo bar")(d);       // syntax error
lax.expr("'foo bar'")(d);     // 'foo bar' (the string literal)
```

### Properties
A much safer and more predictable way to access properties programmatically is with `lax.property()`:

```js
var bar = lax.property("bar");
bar({bar: 10}) // 10
```

### Sort Comparators
Lax provides a simple interface for creating sort comparators (for use with `Array.prototype.sort()`):

```js
var byFoo = lax.sort("foo");
// or: lax.sort("foo asc")
// or: lax.sort("foo", "asc")
[{foo: 5}, {foo: 1}, {foo: 8}].sort(byFoo);
// returns:
[{foo: 1}, {foo: 5}, {foo: 8}]

var byBarLength = lax.sort(lax.expr("bar.length"), "desc");
[{bar: "hi"}, {bar: "ho"}, {bar: "ohai"}].sort(byBarLength);
// sorts with {bar: "ohai"} first
```

`lax.multisort()` allows you to create sort comparators that sort on 2 or more expressions:

```js
var sortByFooBar = lax.multisort("foo asc", "bar desc"),
    objects = [{foo: 2, bar: 0}, {foo: 1, bar: 0}, {foo: 2, bar: 1}];
objects.sort(sortByFooBar);
assert.deepEqual(objects[0], {foo: 1, bar: 0});
assert.deepEqual(objects[2], {foo: 2, bar: 1});
```

### Boolean and Functional Compositions
Lax does boolean and functional compositions, too:

```js
TODO
```

### Shorthand Functions and Lambda Expressions
Lax has functions for creating JavaScript functions from strings in the form of
shorthand and Python-style lambdas:

```js
// f(x) = x, in shorthand form:
lax.fn("f(x) x * x")
// and in Python lambda form:
lax.lambda("lambda x: x * x")
```

### SQL-like Data Selections
Lax also provides a SQL-like data selection interface for tabular data (in the form of Arrays of Objects):

```js
lax.select("agency", lax.sum("budget").as("total_budget"))
  .groupBy("agency")
  .from([
    {agency: "DOD", program: "Star Wars", budget: 1949088023984},
    {agency: "DOD", program: "Killer Robots", budget: 589275792},
    {agency: "DHS", program: "Rad Flag", budget: 10123109845},
    {agency: "DHS", program: "Save Yourselves", budget: 2579808525},
    ...
  ]);
// produces:
[
  {agency: "DOD", total_budget: ...},
  {agency: "DHS", total_budget: ...},
  ...
]
```
