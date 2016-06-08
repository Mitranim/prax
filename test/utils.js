'use strict'

/* eslint-disable no-empty */

const {deepEqual} = require('emerge')

exports.testWith = testWith
function testWith (compare, fun) {
  for (const config of slice(arguments, 2)) {
    const args = toList(config)
    const result = fun.apply(null, args)
    if (!compare(result, config.$)) {
      throw Error(`Function:\n  ${blue(inspect(fun))}\n` +
                  `Arguments:\n  ${blue(inspect(args))}\n` +
                  `Expected:\n  ${blue(inspect(config.$))}\n` +
                  `Got:\n  ${red(inspect(result))}`)
    }
  }
}

exports.test = test
function test () {
  testWith.apply(null, [deepEqual].concat(slice(arguments)))
}

exports.eq = eq
function eq (a, b) {
  test(equal, {0: a, 1: b, $: true})
}

exports.neq = neq
function neq (a, b) {
  test(equal, {0: a, 1: b, $: false})
}

function equal (a, b) {
  return a === b || a !== a && b !== b
}

exports.deq = deq
function deq (a, b) {
  test(deepEqual, {0: a, 1: b, $: true})
}

exports.ndeq = ndeq
function ndeq (a, b) {
  test(deepEqual, {0: a, 1: b, $: false})
}

exports.throws = throws
function throws (fun) {
  let error
  let value
  const args = slice(arguments, 1)
  try {value = fun.apply(null, args)} catch (err) {error = err}
  if (!error) {
    throw Error(`Function:\n  ${blue(inspect(fun))}\n` +
                              `Arguments:\n  ${blue(inspect(args))}\n` +
                              `Expected to ${red('throw')}\n` +
                              `Got:\n  ${blue(inspect(value))}`)
  }
}

exports.ignore = ignore
function ignore (fun) {
  try {fun()} catch (_) {}
}

const codes = {
  blue: '\x1b[34m',
  red: '\x1b[31m',
  inverse: '\x1b[7m',
  reset: '\x1b[0m'
}

function toList (object) {
  return slice(Object.assign({}, object, {length: len(object)}))
}

function len (object) {
  return Math.max.apply(Math, indices(object)) + 1
}

function indices (object) {
  return Object.keys(object).map(Number).filter(x => !isNaN(x))
}

function blue (msg) {
  return `${codes.blue}${msg}${codes.reset}`
}

function red (msg) {
  return `${codes.red}${msg}${codes.reset}`
}

function inspect (value) {
  return require('util').inspect(value, {depth: null})
}

function slice (list, start) {
  return [].slice.call(list, start)
}
