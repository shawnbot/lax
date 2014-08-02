(function(lax) {
"use lax"; // we need eval(), after all

lax.version = "0.0.0";

// borrow some methods from Array.prototype
(function(ap) {

  lax.slice = function(list) {
    return ap.slice.apply(list, ap.slice.call(arguments, 1));
  };

  lax.forEach = function(list) {
    return ap.forEach.apply(list, ap.slice.call(arguments, 1));
  };

})(Array.prototype);

// because I'm lazy
var slice = lax.slice,
    forEach = lax.forEach;

// determine whether something is an Array or Arguments list
lax.isList = function(list) {
  return Array.isArray(list) || String(list) === "[object Arguments]";
};

// identity function
lax.ident = lax.identity = function identity(d) { return d; };

// noop function (returns undefined)
lax.noop = function noop() {};

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
lax.extend = function(obj, props) {
  slice(arguments, 1).forEach(function(other) {
    if (!other) return;
    for (var key in other) obj[key] = other[key];
  });
  return obj;
};

/*
 * lax.property() returns a property accessor function:
 *
 * lax.property('foo')({foo: 'bar'}) -> 'bar'
 */
lax.property = function(prop) {
  if (typeof prop === "function") return prop;
  return function property(d) {
    return d[prop];
  };
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
  var memo = {};
  return function(d) {
    if (!d) d = memo;
    with (d) return eval(expr, d);
  };
};

/*
 * lax.compose() returns a new function that composes each function
 * (or expression) in its arguments:
 *
 * var strLenLen = lax.compose("length", String, "length");
 * strLenLen("Hello!") -> 
 */
lax.compose = function() {
  var fns = flatten(arguments).map(lax.expr),
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
 * lax.sort("foo", function(a, b) { return a - b; }) // custom order comparator
 */
lax.sort = function(expr, order) {
  if (typeof expr === "string") {
    var match = expr.match(/ (asc|desc)/i);
    if (match) {
      if (typeof order === "function" || typeof order === "string") {
        console.warn("Ignoring sort() order:", order);
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
        throw "Unrecognized sort order: " + order;
    }
  } else if (typeof order === "number") {
    order = lax.asc;
  } else if (!order) {
    order = lax.asc;
  }

  var value = lax.expr(expr);
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

lax.not = function(f) {
  return function not() {
    return !f.apply(this, arguments);
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
    return new Function("d", ["return", "d", op, value].join(" "));
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
lax.cmp.mod = lax.cmp("%=");

// is ~ instanceof
lax.cmp.is = lax.cmp("instanceof");
// type ~ typeof
lax.cmp.type = function(type) {
  return function(d) {
    return typeof d === type;
  };
};

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
  return function(d) {
    return (typeof d === "string") && d.match(pattern);
  };
};

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
    return new Function(match[1] || "d", "return " + match[2] + ";");
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
    return new Function(match[1] || "d", "return " + match[2] + ";");
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

})(typeof module === "object"
  ? module.exports
  : this.lax = {});
