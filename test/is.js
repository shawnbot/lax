var lax = require("../index"),
    assert = require("assert");

describe("lax.is.number", function() {
  assert.equal(lax.is.number(1), true);
  assert.equal(lax.is.number(new Number(10)), true);
  assert.equal(lax.is.number("10"), false);
  assert.equal(lax.is.number(null), false);
  assert.equal(lax.is.number(undefined), false);
  assert.equal(lax.is.number(NaN), false);
});

describe("lax.is.bool", function() {
  assert.equal(lax.is.bool(true), true);
  assert.equal(lax.is.bool(false), true);
  assert.equal(lax.is.bool(null), false);
  assert.equal(lax.is.bool(0), false);
  assert.equal(lax.is.bool(undefined), false);
});

describe("lax.is.object", function() {
  assert.equal(lax.is.object({}), true);
  assert.equal(lax.is.object(new Object), true);
  assert.equal(lax.is.object(new Array), true);
  assert.equal(lax.is.object(true), false);
  assert.equal(lax.is.object(null), false);
  assert.equal(lax.is.object(undefined), false);
});

describe("lax.is.string", function() {
  assert.equal(lax.is.string("foo"), true);
  assert.equal(lax.is.string({}), false);
  assert.equal(lax.is.string(new String), true);
  assert.equal(lax.is.string(null), false);
  assert.equal(lax.is.string(undefined), false);
});

describe("lax.is.array", function() {
  assert.equal(lax.is.array(new Array), true);
  assert.equal(lax.is.array([]), true);
  assert.equal(lax.is.array({}), false);
  assert.equal(lax.is.array(null), false);
  assert.equal(lax.is.array(undefined), false);
  assert.equal(lax.is.array(arguments), false);
});

describe("lax.is.list", function() {
  assert.equal(lax.is.list(new Array), true);
  assert.equal(lax.is.list([]), true);
  assert.equal(lax.is.list({length: 0}), true);
  assert.equal(lax.is.list({length: 1}), true);
  assert.equal(lax.is.list(arguments), true);
  assert.equal(lax.is.list({}), false);
  assert.equal(lax.is.list(null), false);
  assert.equal(lax.is.list(undefined), false);
});

describe("lax.is.date", function() {
  assert.equal(lax.is.date(new Date), true);
  assert.equal(lax.is.date("2014-08-07"), false);
  assert.equal(lax.is.date({}), false);
  assert.equal(lax.is.date(null), false);
  assert.equal(lax.is.date(undefined), false);
});

describe("lax.is.undef", function() {
  assert.equal(lax.is.undef(null), true);
  assert.equal(lax.is.undef(undefined), true);
  assert.equal(lax.is.undef({}), false);
  assert.equal(lax.is.undef(false), false);
  assert.equal(lax.is.undef(0), false);
});

describe("lax.is.empty", function() {
  assert.equal(lax.is.empty({}), true);
  assert.equal(lax.is.empty([]), true);
  assert.equal(lax.is.empty(""), true);
  assert.equal(lax.is.empty({length: 1}), false);
  assert.equal(lax.is.empty([,]), false);
  assert.equal(lax.is.empty("foo"), false);
  assert.equal(lax.is.empty({foo: "bar"}), false);
  assert.equal(lax.is.empty(null), true);
  assert.equal(lax.is.empty(undefined), true);
});

describe("lax.is.defined", function() {
  assert.equal(lax.is.defined({}), true);
  assert.equal(lax.is.defined(false), true);
  assert.equal(lax.is.defined(""), true);
  assert.equal(lax.is.defined(0), true);
  assert.equal(lax.is.defined(null), false);
  assert.equal(lax.is.defined(undefined), false);
});

describe("lax.is.nil", function() {
  assert.equal(lax.is.nil(null), true);
  assert.equal(lax.is.nil(undefined), false);
  assert.equal(lax.is.nil(""), false);
  assert.equal(lax.is.nil(0), false);
});

describe("lax.is.nil", function() {
  assert.equal(lax.is.nil(null), true);
  assert.equal(lax.is.nil(undefined), false);
  assert.equal(lax.is.nil(""), false);
  assert.equal(lax.is.nil(0), false);
});
