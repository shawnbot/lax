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
