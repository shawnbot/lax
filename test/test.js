var lax = require("../index"),
    assert = require("assert");

describe("lax.extend", function() {
  it("extends objects", function() {
    var original = {},
        extension = {foo: "bar"},
        result = lax.extend(original, extension);
    assert.equal(result.foo, "bar", "didn't pass on 'foo' property");
    assert.deepEqual(result, extension, "result != extension");
    assert.strictEqual(original, result, "original !== result");
  });
});

describe("lax.flatten", function() {
  it("flattens nested arrays", function() {
    assert.deepEqual(lax.flatten([1, 2]), [1, 2]);
    assert.deepEqual(lax.flatten([1, 2, [3, [4]]]), [1, 2, 3, 4]);
    assert.deepEqual(lax.flatten([1, [[[2]]], [3, [4]]]), [1, 2, 3, 4]);
  });

  it("flattens function arguments", function(done) {
    (function() {
      assert.deepEqual(lax.flatten(arguments), [1, 2, 3, 4, 5]);
      done();
    })(1, [2, 3], [4, [[[5]]]]);
  });
});

describe("lax.expr", function() {
  it("evaluates object properties", function() {
    assert.equal(lax.expr("prop")({prop: 1}), 1);
    assert.equal(lax.expr("prop.length")({prop: "hi"}), 2);
  });
});

describe("lax.property", function() {
  it("evaluates object properties", function() {
    assert.equal(lax.property("prop")({prop: 1}), 1);
    assert.equal(lax.property("length")("hi"), 2);
    assert.equal(lax.property("prop.length")({prop: "hi"}), undefined);
  });
});

describe("lax.compose", function() {
  it("composes functions", function() {
    var lengthOfFirstName = lax.compose(
      function(name) { return name[0]; },
      function(first) { return first.length; }
    );
    assert.equal(lengthOfFirstName(["Joe", "Schmoe"]), 3);
    assert.equal(lengthOfFirstName(["Jo", "Blow"]), 2);
  });
});

describe("boolean functions", function() {
  describe("lax.or", function() {
    it("works with functions", function() {
      var test = lax.or(
        function(d) { return d.foo > 0; }, 
        function(d) { return d.bar < 0; }
      );
      assert.equal(test({foo: 1, bar: 1}), true);
      assert.equal(test({foo: 0, bar: -1}), true);
      assert.equal(test({foo: 0, bar: 0}), false);
    });

    it("works with expressions", function() {
      var test = lax.or("foo > 0", "bar < 0");
      assert.equal(test({foo: 1, bar: 1}), true);
      assert.equal(test({foo: 0, bar: -1}), true);
      assert.equal(test({foo: 0, bar: 0}), false);
    });
  });

  describe("lax.and", function() {
    it("works with functions", function() {
      var test = lax.and(
        function(d) { return d.foo > 0; }, 
        function(d) { return d.bar < 0; }
      );
      assert.equal(test({foo: 1, bar: 1}), false);
      assert.equal(test({foo: 0, bar: -1}), false);
      assert.equal(test({foo: 1, bar: 0}), false);
      assert.equal(test({foo: 1, bar: -1}), true);
    });

    it("works with expressions", function() {
      var test = lax.and("foo > 0", "bar < 0");
      assert.equal(test({foo: 1, bar: 1}), false);
      assert.equal(test({foo: 0, bar: -1}), false);
      assert.equal(test({foo: 1, bar: 0}), false);
      assert.equal(test({foo: 1, bar: -1}), true);
    });
  });
});

describe("sorting", function() {

  describe("lax.asc", function() {
    it("compares numbers ascending", function() {
      assert.equal(lax.asc(1, 0), 1);
      assert.equal(lax.asc(0, 0), 0);
      assert.equal(lax.asc(0, 1), -1);
    });
    it("compares strings ascending", function() {
      assert.equal(lax.asc("a", "b"), -1);
      assert.equal(lax.asc("a", "a"), 0);
      assert.equal(lax.asc("b", "a"), 1);
    });
    it("sorts numbers ascending", function() {
      var numbers = [6, 8, 4, 2];
      assert.deepEqual(numbers.sort(lax.asc), [2, 4, 6, 8]);
    });
    it("sorts strings ascending", function() {
      var chars = "b d c a e".split(" ");
      assert.deepEqual(chars.sort(lax.asc).join(" "), "a b c d e");
    });
  });

  describe("lax.desc", function() {
    it("compares numbers descending", function() {
      assert.equal(lax.desc(1, 0), -1);
      assert.equal(lax.desc(0, 0), 0);
      assert.equal(lax.desc(0, 1), 1);
    });
    it("compares strings descending", function() {
      assert.equal(lax.desc("a", "b"), 1);
      assert.equal(lax.desc("a", "a"), 0);
      assert.equal(lax.desc("b", "a"), -1);
    });
    it("sorts numbers descending", function() {
      var numbers = [6, 8, 4, 2];
      assert.deepEqual(numbers.sort(lax.desc), [8, 6, 4, 2]);
    });
    it("sorts strings descending", function() {
      var chars = "b d c a e".split(" ");
      assert.deepEqual(chars.sort(lax.desc).join(" "), "e d c b a");
    });
  });

  describe("lax.asc.numeric", function() {
    it("compares numbers ascending", function() {
      assert.equal(lax.asc.numeric(1, 0), 1);
      assert.equal(lax.asc.numeric(0, 0), 0);
      assert.equal(lax.asc.numeric(0, 1), -1);
      assert.equal(lax.asc.numeric(0, 2), -2);
    });
    it("sorts numbers descending", function() {
      var numbers = [4, 6, 2, 8];
      assert.deepEqual(numbers.sort(lax.desc.numeric), [8, 6, 4, 2]);
    });
  });

  describe("lax.desc.numeric", function() {
    it("compares numbers descending", function() {
      assert.equal(lax.desc.numeric(1, 0), -1);
      assert.equal(lax.desc.numeric(0, 0), 0);
      assert.equal(lax.desc.numeric(0, 1), 1);
      assert.equal(lax.desc.numeric(0, 2), 2);
    });
    it("sorts numbers ascending", function() {
      var numbers = [4, 6, 2, 8];
      assert.deepEqual(numbers.sort(lax.asc.numeric), [2, 4, 6, 8]);
    });
  });

  describe("lax.sort", function() {
    var objects = [{a: 2}, {a: 3}, {a: 1}],
        sorted = [{a: 1}, {a: 2}, {a: 3}];
    it("sorts with functions", function() {
      assert.deepEqual(objects.sort(lax.sort(
        function(d) { return d.a; }, lax.asc
      )), sorted);
    });
    it("sorts with expressions", function() {
      assert.deepEqual(objects.sort(lax.sort("a", lax.asc)), sorted);
      assert.deepEqual(objects.sort(lax.sort("a", "asc")), sorted);
    });
  });

  describe("lax.multisort", function() {
    var objects = [
      {a: 3, b: 2},
      {a: 1, b: 3},
      {a: 3, b: 1},
      {a: 2, b: 0}
    ];
    it("sorts by two expressions", function() {
      assert.deepEqual(objects.sort(lax.multisort("a", "b")), [
        {a: 1, b: 3},
        {a: 2, b: 0},
        {a: 3, b: 1},
        {a: 3, b: 2}
      ]);
      assert.deepEqual(objects.sort(lax.multisort("a asc", "b desc")), [
        {a: 1, b: 3},
        {a: 2, b: 0},
        {a: 3, b: 2},
        {a: 3, b: 1}
      ]);
    });
  });

});

describe("lax.fn", function() {
  it("handles 'f(x) x' expressions", function() {
    var f = lax.fn("f(x) x + 1");
    assert.notEqual(f, null, "parse error");
    assert.equal(f(0), 1);
    var f = lax.fn("f(x, i) i + 1");
    assert.notEqual(f, null, "parse error");
    assert.equal(f(null, 0), 1);
  });
});

describe("lax.lambda", function() {
  it("handles 'lambda x: x' expressions", function() {
    var f = lax.lambda("lambda x: x + 1");
    assert.notEqual(f, null, "parse error");
    assert.equal(f(0), 1);
    var f = lax.lambda("lambda x, i: i + 1");
    assert.notEqual(f, null, "parse error");
    assert.equal(f(null, 0), 1);
  });
});

describe("lax.enlist", function() {
});

describe("lax.delist", function() {
});

describe("lax.values", function() {
});

describe("lax.coerece", function() {
});

describe("lax.not", function() {
});

describe("lax.cmp", function() {
});

describe("lax.is", function() {
});

describe("lax.select", function() {
  var input = [
    {foo: 0, bar: 0},
    {foo: 1, bar: 0},
    {foo: 2, bar: 1},
    {foo: 1, bar: 2}
  ];
  it("selects named columns only", function() {
    var row = lax.select("foo").from(input)[0];
    assert.deepEqual(Object.keys(row), ["foo"]);
  });

  it("groups rows using aggregate functions", function() {
    var rows = lax.select("foo", lax.max("bar").as("max_bar"))
      .groupBy("foo")
      .orderBy("max_bar desc", "foo desc")
      .from(input)
    assert.deepEqual(rows[0], {max_bar: 2, foo: 1});
    assert.deepEqual(rows[2], {max_bar: 0, foo: 0});
  });
});

describe("lax.nest", function() {
});

describe("lax.groupBy", function() {
});

describe("lax.agg, et al", function() {
});
