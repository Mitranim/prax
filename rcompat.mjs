// Optional adapters for migrating React-based apps to Prax.

/* Public API */

/*
Replaces `React.createElement`. Usage:

  import * as x from 'prax'
  import {R} from 'prax/rcompat.mjs'

  export {F} from 'prax/rcompat.mjs'
  export function E(...args) {return R(x.E, ...args)}
  export function S(...args) {return R(x.S, ...args)}
*/
export function R(E, type, props, ...children) {
  valid(E, isFun)
  props = dict(props)

  try {
    if (isFun(type)) {
      propsToReact(props, children)
      const pro = type.prototype
      if (pro && isFun(pro.render)) return new type(props).render()
      return type(props)
    }

    children = propsFromReact(props, children)
    return E(type, props, ...children)
  }
  finally {
    Object.freeze(props)
  }
}

/*
Replaces `React.Fragment`. The calls should be auto-generated by a JSX/TSX
transpiler.
*/
export function F({children}) {return children}

/* Internal Utils */

function propsToReact(props, children) {
  props.key = undefined
  props.children = comb(trim(props.children), trim(children))
}

function propsFromReact(props, children) {
  if (!props || !('children' in props)) return children
  children = comb(props.children, children)
  delete props.children
  return children
}

// Imitates React's quirky "optimization" of children:
//
//   []     -> null
//   [a]    -> a
//   [a, b] -> [a, b]
function trim(children) {
  if (isArr(children)) {
    if (!children.length) return null
    if (children.length === 1) return trim(children[0])
  }
  return children
}

function comb(a, b) {
  return isNil(a) ? b : isNil(b) ? a : [a, b]
}

function isFun(val) {return typeof val === 'function'}
function isNil(val) {return val == null}
function isArr(val) {return isInst(val, Array)}
function isComp(val) {return isObj(val) || isFun(val)}
function isObj(val) {return val !== null && typeof val === 'object'}
function isInst(val, Cls) {return isComp(val) && val instanceof Cls}

function isDict(val) {
  if (!isObj(val)) return false
  const proto = Object.getPrototypeOf(val)
  return proto === null || proto === Object.prototype
}

function only(val, test) {valid(val, test); return val}
function dict(val) {return isNil(val) ? {} : only(val, isDict)}

function valid(val, test) {
  if (!test(val)) throw Error(`expected ${show(val)} to satisfy test ${show(test)}`)
}

// Placeholder, might improve.
function show(val) {return (isFun(val) && val.name) || String(val)}
