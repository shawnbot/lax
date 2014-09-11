var lax = require("../index"),
    assert = require("assert");

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

describe("lax.fn", function() {
  it("handles 'f(x) x' expressions", function() {
    var f = lax.fn("f(x) x + 1");
    assert.notEqual(f, null, "parse error");
    assert.equal(f(2), 3);

    var f = lax.fn("f(x, i) i + 1");
    assert.notEqual(f, null, "parse error");
    assert.equal(f(null, 2), 3);
  });

  it("handles 'fn(x) x' expressions", function() {
    var f = lax.fn("fn(x) x + 1");
    assert.notEqual(f, null, "parse error");
    assert.equal(f(2), 3);
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

describe("lax.not", function() {
  // TODO
});

describe("lax.cmp", function() {
  // TODO
});
