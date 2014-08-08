var lax = require("../index"),
    assert = require("assert");

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
