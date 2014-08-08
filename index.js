(function (lax) {
  "use strict";
  /* jshint -W014 */

  lax.version = "0.0.1";

  var parse = require("esprima").parse,
      staticEval = require("static-eval"),
      evaluate = function evaluate(src, locals) {
        var ast = parse(src).body[0].expression;
        return staticEval(ast, locals);
      },
      createFunction = function(args, body) {
        if (typeof args === "string") args = args.split(/\s*,\s*/);
        var len = args.length,
            i;
        return function fn() {
          var locals = {};
          for (i = 0; i < len; i++) locals[args[i]] = arguments[i];
          return evaluate(body, locals);
        };
      };

  // lax.eval() should work like `eval()` (but safe)
  lax.eval = evaluate; // jshint ignore:line
  // and lax.function() should work like `new Function()` (but safe)
  lax.function = createFunction;

  // borrow some methods from Array.prototype
  (function(ap) {

    lax.slice = function(list) {
      return ap.slice.apply(list, ap.slice.call(arguments, 1));
    };

    lax.forEach = function(list, fn) {
      return ap.forEach.apply(list, ap.slice.call(arguments, 1));
    };

    lax.map = function(list, fn) {
      return ap.map.apply(list, ap.slice.call(arguments, 1));
    };

  })(Array.prototype);

  // because I'm lazy
  var slice = lax.slice,
      forEach = lax.forEach;

  // identity function
  lax.ident = lax.identity = function identity(d) { return d; };

  var alias = lax.alias = function(fn, name) {
    fn.as = function(alias) {
      fn.alias = alias;
      return fn;
    };
    fn.toString = function() {
      return lax.alias.get(this);
    };
    return fn.as(name);
  };

  lax.alias.get = function(fn) {
    return fn.alias || fn.name;
  };

  // noop function (returns undefined)
  lax.noop = function noop() {};

  // functor
  lax.functor = function(d) {
    return (typeof d === "function")
      ? d
      : function() { return d; };
  };

  // literal value
  lax.literal = function(d) {
    return function literal() {
      return d;
    };
  };

  var flatten = lax.flatten = function() {
    var flat = [];
    forEach(arguments, function(arg, i) {
      if (lax.isList(arg)) {
        forEach(arg, function(a) {
          var sub = flatten(a);
          if (!sub.length) return;
          flat = flat.concat(sub);
        });
      } else {
        flat.push(arg);
      }
    });
    return flat;
  };

  /*
   * lax.extend() takes 1 or more objects, and returns
   * the first one with keys coped from every other one.
   */
  var extend = lax.extend = function(obj, props) {
    slice(arguments, 1).forEach(function(other) {
      if (!other) return;
      for (var key in other) obj[key] = other[key];
    });
    return obj;
  };

  // determine whether something is an Array or Arguments list
  lax.isList = function isList(list) {
    return Array.isArray(list)
        || (lax.is.object(list) && lax.is.number(list.length));
    // TODO: alias these as local variables for faster lookup
  };

  /*
   * lax.property() returns a property accessor function:
   *
   * lax.property('foo')({foo: 'bar'}) -> 'bar'
   */
  lax.property = function(prop) {
    if (typeof prop === "function") return prop;
    return alias(function(d) {
      return d[prop];
    }, prop);
  };

  /*
   * lax.expr() returns an expression evaluator that exposes properties of
   * the first argument as variables:
   *
   * lax.expr('substr(1, 2)')('Hello') -> 'ell'
   *
   * The eval() context should also include the lax namespace, so you can use
   * lax functions in side your expressions.
   */
  lax.expr = function(expr) {
    if (typeof expr === "function") return expr;
    var globals = {lax: lax};
    return alias(function(d) {
      if (!d) d = globals;
      return evaluate(expr, d);
    }, expr);
  };

  /*
  function sanitize(d) {
    var o = {};
    for (var k in d) {
      var s = k.replace(/\W/g, "_")
        .replace(/_+$/, "")
      if (s.match(/^\W/)) {
        s = "_" + s;
      }
      o[s] = d[k];
    }
    return o;
  }
  */

  // shorthands
  lax.p = lax.property;
  lax.e = lax.expr;

  /*
   * lax.compose() returns a new function that composes each function
   * (or expression) in its arguments:
   *
   * var strLenLen = lax.compose("length", String, "length");
   * strLenLen("Hello!") -> 1
   */
  lax.compose = function() {
    var fns = flatten(arguments).map(lax.property),
        length = fns.length,
        i;
    return function composed(d) {
      for (i = 0; i < length; i++) {
        d = fns[i].call(this, d);
      }
      return d;
    };
  };

  /*
   * create a wrapped function that returns the boolean ! of the other function
   */
  lax.not = function(f) {
    f = lax.expr(f);
    return alias(function not() {
      return !f.apply(this, arguments);
    }, "!" + lax.alias.get(f));
  };

  /*
   * create a function that returns true if any of the provided functions
   * (or expressions) returns true for the given arguments.
   */
  lax.or = function() {
    var tests = flatten(arguments).map(lax.expr),
        length = tests.length,
        i;
    return function or() {
      for (i = 0; i < length; i++) {
        if (tests[i].apply(this, arguments)) return true;
      }
      return false;
    };
  };

  /*
   * create a function that returns true iff all of the provided functions (or
   * expressions) returns true for the given arguments.
   */
  lax.and = function and() {
    var tests = flatten(arguments).map(lax.expr),
        length = tests.length,
        i;
    return function() {
      for (i = 0; i < length; i++) {
        if (!tests[i].apply(this, arguments)) return false;
      }
      return true;
    };
  };

  // ascending comparator
  lax.asc = function(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
  };

  // descending comparator
  lax.desc = function(a, b) {
    return a > b ? -1 : a < b ? 1 : 0;
  };

  // numeric ascending
  lax.asc.numeric = function(a, b) {
    return a - b;
  };

  // numeric descending
  lax.desc.numeric = function(a, b) {
    return b - a;
  };

  /*
   * lax.sort() returns a comparator function for use with Array.prototype.sort():
   *
   * lax.sort("foo") // sort on the expression "foo", ascending by default
   * lax.sort("foo desc") // sort on the expression "foo", descending
   * lax.sort("foo", "desc") // sort on the expression "foo", descending
   * lax.sort("foo", lax.asc) // use the asc order
   * lax.sort("foo", function(a, b) { return a - b; }) // or a custom order
   */
  lax.sort = function(expr, order) {
    if (typeof expr === "string") {
      // if the expression ends in "asc" or "desc" preceded by a space
      // (which would be an invalid JavaScript expression anyway), use
      // that as the sort order
      var match = expr.match(/ (asc|desc)/i);
      if (match) {
        if (typeof order === "function" || typeof order === "string") {
          console.warn("ignoring sort() order:", order);
        }
        order = match[1];
        expr = expr.substr(0, expr.length - (order.length + 1));
      }
    }

    if (typeof order === "string") {
      switch (order.toLowerCase()) {
        case "asc":
          order = lax.asc;
          break;
        case "desc":
          order = lax.desc;
          break;
        default:
          throw new Error("lax.sort(): unrecognized sort order: '" + order + "'");
      }
    } else if (typeof order === "number") {
      order = lax.asc;
    } else if (!order) {
      order = lax.asc;
    }

    var value = lax.property(expr);
    return function sort(a, b) {
      return order(value(a), value(b));
    };
  };

  /*
   * create a multi-sort comparator:
   *
   * lax.multisort("foo asc", "bar desc");
   */
  lax.multisort = function() {
    var sorts = flatten(arguments).map(lax.sort),
        length = sorts.length,
        i;
    return function multisort(a, b) {
      var order = 0;
      for (i = 0; i < length; i++) {
        order = sorts[i](a, b);
        if (order < 0 || order > 0) break;
      }
      return order;
    };
  };


  /*
   * A simple if/else evaluator:
   *
   * lax.iff("foo > 1", "bar", "baz")({foo: 2, bar: 'a', baz: 'b'}) -> 'b'
   * lax.iff("foo > 1", lax.literal(10), lax.literal(-10))({ ... }) -> 10/-10
   */
  lax.iff = function(expr, yes, no) {
    expr = lax.expr(expr);
    yes = lax.expr(yes);
    no = lax.expr(no);
    return function iff(d) {
      return expr(d) ? yes(d) : no(d);
    };
  };

  // create a function that returns the index of a value in an Array
  // (provided either as separate arugments or a single Array)
  lax.indexIn = function(values) {
    values = flatten(arguments);
    return function indexIn(d) {
      return values.indexOf(d);
    };
  };

  /*
   * The lax.cmp.* functions are functions that generate comparators:
   *
   * lax.cmp("==")(5)(4) // false
   * lax.cmp("==")(5)(5) // true
   * lax.cmp(">=")(5)(4) // false
   */
  lax.cmp = function(op) {
    return function cmp(value) {
      return alias(
        createFunction("d", ["d", op, value].join(" ")),
        [op, value].join("")
      );
    };
  };

  // common operators
  lax.cmp.eq = lax.cmp("==");
  lax.cmp.eqq = lax.cmp("===");
  lax.cmp.neq = lax.cmp("!=");
  lax.cmp.neqq = lax.cmp("!==");
  lax.cmp.gt = lax.cmp(">");
  lax.cmp.gte = lax.cmp(">=");
  lax.cmp.lt = lax.cmp("<");
  lax.cmp.lte = lax.cmp("<=");
  lax.cmp.mod = lax.cmp("%");
  lax.cmp.plus = lax.cmp.add = lax.cmp("+");
  lax.cmp.minus = lax.cmp.sub = lax.cmp("-");

  // is ~ instanceof
  lax.cmp.instance = function(klass) {
    return function instance(d) {
      return d instanceof klass;
    };
  };

  // type ~ typeof
  lax.cmp.type = function(type) {
    return alias(function(d) {
      return typeof d === type;
    }, "type:" + type);
  };

  /*
   * lax.is(type) -> lax.cmp.type(type)
   * lax.is(class) -> lax.cmp.instance(class)
   * lax.is(alias) -> alias
   */
  lax.is = function(type) {
    return lax.is[type] || (
      typeof type === "string"
        ? lax.cmp.type(type)
        : lax.cmp.is(type)
    );
  };

  var defined = function defined(x) {
    return x !== null && (typeof x !== "undefined");
  };

  lax.is.defined = defined;

  // shorthand type checkers
  lax.is.bool = function bool(b) {
    return b === true || b === false || (b instanceof Boolean);
  };

  lax.is.number = function number(n) {
    return !isNaN(n) && ((typeof n === "number") || n instanceof Number);
  };

  lax.is.object = function object(o) {
    return (typeof o === "object") && defined(o);
  };

  lax.is.string = function string(s) {
    return (typeof s === "string") || (s instanceof String);
  };

  lax.is.array = alias(Array.isArray, "array");
  lax.is.date = lax.cmp.instance(Date);

  lax.is.undef = function undef(x) {
    return x === null || typeof x === "undefined";
  };

  lax.is.empty = function empty(d) {
    // anything that evaluates to false in boolean context is "empty"
    if (!d) return true;
    // if a list-like object has zero length, return true
    else if (typeof d.length === "number") return d.length === 0;
    // otherwise, if the object has any keys, return false
    for (var key in d) return false;
    // empty!
    return true;
  };

  lax.is.nil = function nil(x) { return x === null; };

  lax.is.integer = function integer(n) { return n % 1 === 0; };
  lax.is.floating = function floating(n) { return n % 1 > 0; };

  lax.is.not = function(what) {
    if (!lax.is.hasOwnProperty(what)) {
      throw new Error("lax.is.not() got a bad is method name: '" + what + "'");
    }
    return lax.not(lax.is[what]);
  };

  lax.is.list = lax.isList;

  /*
   * A regular expression matcher:
   *
   * lax.cmp.re("^foo?$")
   * lax.cmp.re(/^foo?$/i)
   * lax.cmp.re("/^foo?$/i")
   */
  lax.cmp.re = function(pattern) {
    if (typeof pattern === "string") {
      var match = pattern.match(/^\/(.*)\/([a-z]+)?$/);
      if (match) pattern = new RegExp(match[1], match[2]);
    }
    return alias(function(d) {
      return (typeof d === "string") && d.match(pattern);
    }, "re:" + pattern);
  };

  // alias to lax.like()
  lax.like = lax.cmp.re;

  /*
   * Determine if a value is in any of the (flattened) arguments:
   *
   * lax.cmp.in(1, 2)(0) // false
   * lax.cmp.in(1, 2)(1) // true
   * lax.cmp.in([2, 4])(2) // true
   * lax.cmp.in([2, [4]])(4) // true
   */
  lax.cmp.in = function(values) {
    values = lax.flatten(arguments);
    return function isin(d) {
      return values.indexOf(d) > -1;
    };
  };

  /*
   * A shorthand function parser, hold the curly braces and return keyword:
   *
   * lax.fn("f(x) x + 1") -> function(x) { return x + 1; }
   * lax.fn("fn(d, i) i") -> function(d, i) { return i; }
   */
  lax.fn = function(expr) {
    var match = expr.match(lax.fn.pattern);
    if (match) {
      return createFunction(match[1] || "d", match[2]);
    }
    return null;
  };

  lax.fn.pattern = /^fn?\s*\(([^\)]+)\)\s*\{?\s*(.+)\s*?$/;

  /*
   * A Python-style lambda function parser, but with support for multiple
   * arguments:
   *
   * lax.lambda("lambda x: x + 1") -> function(x) { return x + 1; }
   * lax.lambda("lambda d, i: i") -> function(d, i) { return i; }
   */
  lax.lambda = function(expr) {
    var match = expr.match(lax.lambda.pattern);
    if (match) {
      return createFunction(match[1] || "d", match[2]);
    }
    return null;
  };

  lax.lambda.pattern = /^lambda?\s+([^\:]+):\s*(.+)$/;

  // lax.delist([1, 2], ["a", "b"]) -> {a: 1, b: 2}
  lax.delist = function(list, keys) {
    var out = {};
    keys.forEach(function(k, i) {
      out[k] = list[i];
    });
    return out;
  };

  // lax.enlist({a: 1, b: 2}, ["a", "b"]) -> [1, 2]
  lax.enlist = function(obj, keys) {
    return keys.map(function(k) {
      return obj[k];
    });
  };


  /*
   * simple type coercion
   */
  lax.coerce = {
    // lax.coerce.string(2) -> "2"
    string: String,
    // lax.coerce.number("2") -> 2
    number: function(d) { return +d || 0; },
    // lax.coerce.list(1) -> [1]
    // lax.coerce.list([1, 2]) -> [1, 2]
    list: function(d) {
      return lax.isList(d) ? slice(d) : [d];
    }
  };

  /*
   * key-specific coercion:
   *
   * lax.coerce.key("foo", "number")({foo: "2"}) -> {foo: 2}
   */
  lax.coerce.key = function(key, type) {
    if (type in lax.coerce) type = lax.coerce[type];
    return function(d) {
      return d && (d[key] = type(d[key])), d;
    };
  };

  /*
   * object coercion with a key setter:
   *
   * var coerce = lax.coerce.object()
   *   .key("foo", "number")
   *   .key("bar", "string");
   * coerce({foo: "2", bar: 1}) -> {foo: 2, bar: "2"}
   */
  lax.coerce.object = function() {
    var ops = [];
    function coerce(d) {
      ops.forEach(function(op) {
        op(d);
      });
      return d;
    }

    coerce.key = function(key, type) {
      ops.push(lax.coerce.key(key, type));
    };

    return coerce;
  };

  /*
   * lax.select() provides a SQL-like interface for "selecting" arbitrary
   * columns (expressions, or any function), filtering, grouping, and slicing.
   *
   * lax.select("a", "b.length")
   *   .where("c > 2")
   *   .from([
   *     {a: "hi", b: "beep",   c: 2},
   *     {a: "ho", b: "boop",   c: 0},
   *     {a: "yo", b: "bleep",  c: 3}
   *   ]);
   * // returns:
   * [
   *   {a: "hi", "b.length": 4},
   *   {a: "yo", "b.length": 5}
   * ]
   *
   * lax.select(lax.p("foo").as("f"), lax.max("bar").as("max_bar"))
   *  .groupBy("foo")
   *  .from([
   *    {foo: 1, bar: 2},
   *    {foo: 1, bar: 6},
   *    {foo: 2, bar: 3},
   *    {foo: 2, bar: 1}
   *  ]);
   * // returns:
   * [
   *   {f: 1, "max_bar": 6},
   *   {f: 2, "max_bar": 3}
   * ]
   */
  lax.select = function(exprs) {
    exprs = flatten(arguments).map(lax.property);

    var filter,
        groupBy,
        having,
        sort,
        limit = 0,
        offset = 0,
        splat = true;

    var columns = exprs.filter(function(e) { return !e.aggregate; }),
        aggregates = exprs.filter(function(e) { return e.aggregate; });

    if (columns.length) {
      var i = columns.map(function(c) {
        return c.alias;
      })
      .indexOf("*");
      if (i > -1) {
        columns.splice(i, 1);
        splat = true;
      } else {
        splat = false;
      }
    }

    function select(rows) {
      var out = rows.map(select.row);
      if (filter) out = out.filter(filter);
      if (groupBy) {
        out = group(out, rows);
        if (having) out = out.filter(having);
      }
      if (sort) out.sort(sort);
      if (offset > 0) out = out.slice(offset);
      if (limit > 0) out = out.slice(0, limit);
      return out;
    }

    select.row = function(row) {
      return makeRow(row);
    };

    select.where = function() {
      filter = lax.and(arguments);
      return select;
    };

    select.orderBy = function() {
      sort = lax.multisort(arguments);
      return select;
    };

    select.limit = function(x, y) {
      if (!arguments.length) return limit;
      limit = x;
      if (arguments.length > 1) offset = y;
      return select;
    };

    select.offset = function(x) {
      if (!arguments.length) return offset;
      offset = x;
      return select;
    };

    select.from = function(rows) {
      return select(rows);
    };

    select.groupBy = function() {
      groupBy = lax.groupBy(arguments);
      return select;
    };

    select.having = function() {
      having = lax.and(arguments);
      return select;
    };

    function makeRow(row) {
      if (splat || !columns.length) return row;
      var d = {};
      if (splat) extend(d, row);
      for (var i = 0, len = columns.length; i < len; i++) {
        var col = columns[i],
            key = lax.alias.get(col);
        d[key] = col(row);
      }
      return d;
    }

    function group(rows, input) {
      // create an index lookup
      rows.forEach(function(d, i) {
        d.__index__ = i;
      });

      var groups = groupBy(rows);

      var grouped = groups.map(function(g) {
        var set = g.__rows__.map(function(d) {
          return input[d.__index__];
        });
        delete g.__rows__;
        aggregates.forEach(function(agg) {
          var key = lax.alias.get(agg);
          g[key] = agg(set);
        });
        return g;
      });

      // clean up after ourselves
      rows.forEach(function(d, i) {
        delete d.__index__;
      });

      return grouped;
    }

    return select;
  };

  lax.nest = function(expr) {
    var groups = flatten(arguments).map(lax.property);
    if (!groups.length) {
      throw new Error("lax.group() expects at least one expression");
    }
    function group(rows, g) {
      var out = {},
          expr = groups[g],
          row, key;
      for (var i = 0, len = rows.length; i < len; i++) {
        row = rows[i];
        key = expr(row);
        if (out.hasOwnProperty(key)) {
          out[key].push(row);
        } else {
          out[key] = [row];
        }
      }
      if (g < groups.length - 1) {
        for (key in out) {
          out[key] = group(out[key], g + 1);
        }
      }
      return out;
    }
    return function nest(rows) {
      return group(rows, 0);
    };
  };

  lax.groupBy = function(columns) {
    var groups = flatten(arguments).map(lax.property);
    return function group(rows) {
      var lookup = {},
          entries = [],
          row,
          values,
          key,
          map = function(g) { return g(row); };
      for (var i = 0, len = rows.length; i < len; i++) {
        row = rows[i];
        values = groups.map(map);
        key = values.join("/");
        if (lookup.hasOwnProperty(key)) {
          lookup[key].rows.push(row);
        } else {
          entries.push(lookup[key] = {
            values: values,
            key: key,
            rows: [row]
          });
        }
      }
      return entries.map(function(d) {
        var g = {__rows__: d.rows};
        groups.forEach(function(group, i) {
          var key = lax.alias.get(group);
          g[key] = d.values[i];
        });
        return g;
      });
    };
  };

  lax.values = function(obj) {
    var values = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) values.push(obj[key]);
    }
    return values;
  };

  lax.agg = function(reduce) {
    return function(expr) {
      if (expr) expr = lax.property(expr);
      var agg = alias(function(d) {
        return reduce(expr ? d.map(expr) : d);
      }, reduce.name + "(" + (expr ? lax.alias.get(expr) : "") + ")");
      agg.aggregate = true;
      return agg;
    };
  };

  lax.count = function count(d) {
    return d.length;
  };

  lax.min = lax.agg(function min(d) {
    if (!d.length) return undefined;
    var n = d[0],
        v,
        i,
        len = d.length;
    for (i = 1, len = d.length; i < len; i++)
      if (v = d[i], v < n) n = v;
    return n;
  });

  lax.max = lax.agg(function max(d) {
    if (!d.length) return undefined;
    var n = d[0],
        v,
        i,
        len = d.length;
    for (i = 1; i < len; i++)
      if (v = d[i], v > n) n = v;
    return n;
  });

  var isNumber = lax.is.number;
  lax.sum = lax.agg(function sum(d) {
    if (!d.length) return 0;
    var n = 0,
        i,
        len = d.length;
    for (i = 0; i < len; i++)
      if (isNumber(d[i])) n += d[i];
    return n;
  });

})(typeof module === "object" ? module.exports : this.lax = {});
