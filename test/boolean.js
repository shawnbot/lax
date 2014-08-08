var lax = require("../index"),
    assert = require("assert");

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
