## Overview

Prax is an umbrella for 3 other libraries: `espo`, `emerge`, and `fpx`. They
have their own documentation (see below). Prax re-exports everything under one
namespace, adding a React adapter and a few minor utilities.

Prax is heavily inspired by [`clojure.core`](https://clojuredocs.org/core-library)
and
[Clojure's philosophy](https://github.com/matthiasn/talk-transcripts/blob/master/Hickey_Rich/AreWeThereYet.md).
The React layer is heavily inspired by [Reagent](http://reagent-project.github.io).
If you're familiar with them, you should feel right at home.

On this page, the entire library is available as `window.prax`. You can run
non-React examples in the console.

## `PraxComponent`

`extends React.PureComponent`

Base class for your React components. Supports automatic subscriptions to
observable data sources such as
[`Atom`](https://mitranim.com/espo/#-atom-value-). It's a thin adapter between
React components and [`espo.Runner`](https://mitranim.com/espo/#-runner-),
a general-purpose tool for implicit reactivity.

```js
const React = require('react')
const {render} = require('react-dom')
const {Atom, PraxComponent, byPath} = require('prax')

// Observable reference acting as central data store
const store = new Atom({message: {greeting: 'Hello', name: 'world'}})

// Custom React component with implicit reactivity
class View extends PraxComponent {
  subrender ({deref}) {
    // Get data AND automatically subscribe
    const greeting = deref(byPath(store, ['message', 'greeting']))
    const name = deref(byPath(store, ['message', 'name']))

    return (
      <div>
        <input
          value={name || ''}
          onChange={({target: {value}}) => {
            store.swap(putIn, ['message', 'name'], value)
          }} />
        <span> Message: {greeting} {name}!</span>
      </div>
    )
  }
}

render(<View />, document.getElementById('root'))
```

### `praxComponent.subrender(runner)`

In Prax components, you must define `subrender` instead of `render`.

Receives the instance of [`espo.Runner`](https://mitranim.com/espo/#-runner-)
associated with this component instance. Use `runner.deref()` to pull data from
observable refs and automatically subscribe.

```js
const {Atom, PraxComponent, byPath} = require('prax')

const store = new Atom({msg: 'Hello world!'})

class View extends PraxComponent {
  subrender ({deref}) {
    // Subscribes to entire store
    const _msg = deref(store)
    // Subscribes only to msg
    const msg = deref(byPath(store, ['msg']))

    return <div>{msg}</div>
  }
}
```

### `praxComponent.setup(props, state)`

Helps avoid the common mistake of defining props-dependent state in
`componentWillMount` but not in `componentWillReceiveProps`. Usually you need to
define both, but forget.

If `setup` is defined, it's called on the initial setup and later on each
meaningful props change. In technical terms, it's called on `componentWillMount`
and later on each `componentWillReceiveProps` if `shouldComponentUpdate` returns
`true`.

```js
const {PraxComponent} = require('prax')

class Greeting extends PraxComponent {
  subrender () {
    return <div>{this.state.msg}</div>
  }

  // If props change, state will correctly match them
  setup (props, _state) {
    this.setState({msg: `Hello ${props.name}!`})
  }
}
```

### `praxComponent.shouldComponentUpdate()`

An optimal `shouldComponentUpdate` strategy is crucial for performance. Many
developers ignore it, producing slow apps and giving React a bad reputation.

`PraxComponent` has a default `shouldComponentUpdate` tuned for the most common
case. It deeply compares props and state via
[`emerge.equalBy`](https://github.com/Mitranim/emerge#equalbytest-one-other)
and considers all functions "equal". Prax components tend to receive data from
external observables, and therefore have shallow props and little to no state.
As for functions, it's common to pass inline lambdas which have a different
reference each time, and uncommon to pass genuinely different functions under
the same key.

Bottom line, it eliminates redundant updates and greatly improves performance.

You may want to override `shouldComponentUpdate` if:

  * props or state contain extremely large data structures
  * props or state may receive genuinely different functions under the same key

## `byPath(observable, path)`

Observes the value inside `observable` at `path`. Example:

```js
const {Atom, Runner, byPath} = require('prax')

const atom = new Atom({msg: {greeting: 'Hello world!'}})
const greeting = byPath(atom, ['msg', 'greeting'])

const runner = Runner.loop(({deref}) => {
  console.info('greeting:', deref(greeting))
})

// When you're done
runner.deinit()
```

Shortcut to [`espo.PathQuery`](https://mitranim.com/espo/#-pathquery-observableref-path-)
with [`emerge.equal`](https://github.com/Mitranim/emerge#equalone-other).

In RxJS terms, `byPath(observable, path)` is equivalent to:

```js
const {getIn, equal} = require('emerge')
observable.map(value => getIn(value, path)).distinct(equal)
```

## `on(argPattern, fun)`

Pattern-matching utility for [event systems](examples#event-system). Creates
a function that tests its arguments against the pattern and runs `fun` if the
pattern matches.

Pattern matching is done by [`fpx.test`](https://mitranim.com/fpx/#-test-pattern-).

```js
const {on} = require('prax')

const listener = on(
  // 1st arg pattern     2nd arg pattern
  [{type: 'greeting'}, {message: isString} /* , ... more patterns */],
  ({type}, {message}) => {
    console.info(message)
    return true
  }
)

listener()
// no match

listener('greeting', 'message')
// no match, returns 'greeting'

listener({type: 'goodbye'}, {message: 'Farewell world!'})
// no match, returns {type: 'goodbye'}

listener({type: 'greeting'}, {message: 'Hello world!'})
// prints 'Hello world!', returns true
```

## Espo

General-purpose tools for observables, subscriptions, broadcasts. Lightweight
alternative to RxJS. Provides the core mechanisms Prax is built on: observable
refs such as [`Atom`](https://mitranim.com/espo/#-atom-value-), implicit
subscriptions via [`Runner`](https://mitranim.com/espo/#-runner-), and an
[event system](examples#event-system) via
[`MessageQue`](https://mitranim.com/espo/#-messageque-).

Docs: https://mitranim.com/espo/

## Emerge

Library for using plain JS data as immutable, functional data
structures. Lightweight alternative to ImmutableJS. Heavily influenced by
[Clojure's philosophy](https://github.com/matthiasn/talk-transcripts/blob/master/Hickey_Rich/AreWeThereYet.md)
and [`clojure.core`](https://clojuredocs.org/core-library).

Docs: https://github.com/Mitranim/emerge

## fpx

Functional programming utils. Lightweight alternative to Lodash with a richer
higher-order function toolkit.

Docs: https://mitranim.com/fpx/