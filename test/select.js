var lax = require("../index"),
    assert = require("assert");

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
