# tarkjs

Collection of promise oriented functions and classes.

[![travis-ci](https://travis-ci.org/T4rk1n/tarkjs.svg?branch=master)](https://travis-ci.org/T4rk1n/tarkjs)
[![Test Coverage](https://codeclimate.com/github/T4rk1n/tarkjs/badges/coverage.svg)](https://codeclimate.com/github/T4rk1n/tarkjs/coverage)
[![Code Climate](https://codeclimate.com/github/T4rk1n/tarkjs/badges/gpa.svg)](https://codeclimate.com/github/T4rk1n/tarkjs/)
[![esdocs](https://doc.esdoc.org/github.com/T4rk1n/tarkjs/badge.svg)](https://doc.esdoc.org/github.com/T4rk1n/tarkjs/)
[![npm version](https://badge.fury.io/js/tarkjs.svg)](https://www.npmjs.com/package/tarkjs)
[![npm downloads](https://img.shields.io/npm/dt/tarkjs.svg)](https://www.npmjs.com/package/tarkjs)
[![Known Vulnerabilities](https://snyk.io/test/github/T4rk1n/tarkjs/badge.svg)](https://snyk.io/test/github/T4rk1n/tarkjs)
[![Dependencies](https://david-dm.org/T4rk1n/tarkjs.svg)](https://david-dm.org/T4rk1n/tarkjs)
[![devDependencies Status](https://david-dm.org/T4rk1n/tarkjs/dev-status.svg)](https://david-dm.org/T4rk1n/tarkjs?type=dev)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

### Installation

Install with npm: `npm i -S tarkjs`

### Usage

ES6 imports.

`import * as tarkjs from 'tarkjs' `

There is no default export.

#### Custom Events and Stores

##### [EventBus](https://doc.esdoc.org/github.com/T4rk1n/tarkjs/class/src/event-bus/event-bus.js~EventBus.html)

The EventBus is a custom event dispatcher that process events to handlers 
in the order they were added asynchronously. The events are cancelable by the handlers 
and the dispatch, stopping propagation to the next handler. The return value of each
handler is kept in an accumulator and the original dispatch will resolve with those values. 

```javascript
import { EventBus, changeNotifier } from 'tarkjs'

const eventBus = new EventBus()

// Create an object that send events when it's properties are set.
const notifier = changeNotifier({message: 'hello'}, eventBus)

// attach an handler
eventBus.addEventHandler('message_value_changed', (e) => {
    console.log(e.payload.newValue)
})

// send a value changed event
notifier.message = 'hi'

// Send any event 
eventBus.addEventHandler('custom_event', ({event, payload, acc, i, end}) => {
    // code...
})

eventBus.dispatch({event: 'custom_event', payload: 'hello'})

// Accumulate
[1, 2, 3].forEach(i => eventBus.addEventHandler('accumulate', () => i))
const { promise } = eventBus.dispatch({event: 'accumulate'})
promise.then((value) => value.reduce((p,n) => p+n))

```
###### Regex handler

Give a regex as event to `EventBus#addEventHandler` to handle any events that match the pattern.

###### Notifiers

- [changeNotifier](https://doc.esdoc.org/github.com/T4rk1n/tarkjs/function/index.html#static-function-changeNotifier)
Dispatch events when an object properties are set.
- [mutationNotifier](https://doc.esdoc.org/github.com/T4rk1n/tarkjs/function/index.html#static-function-mutantNotifier)
Dispatch events on dom-changes.
- [webworkerNotifier](https://doc.esdoc.org/github.com/T4rk1n/tarkjs/function/index.html#static-function-workerNotifier)
Dispatch events on web-worker message.
- [promiseNotifier](https://doc.esdoc.org/github.com/T4rk1n/tarkjs/function/index.html#static-function-promiseNotifier)
Dispatch events on promise resolve or rejection.

##### [PromiseStore](https://doc.esdoc.org/github.com/T4rk1n/tarkjs/class/src/persistance/mem-stores.js~PromiseStore.html)

Store the result and dispatch events of promise resolve and rejection from promise creator functions.

```javascript
import { PromiseStore, fetchRequest } from 'tarkjs'

// Actions must return a promise.
const store = new PromiseStore({simple_fetch: (url) => fetchRequest(url)})

// Subscribe get all the events of an action.
store.subscribe('simple_fetch', (e) => {
    const { fulfilled } = store.actionStore.simple_fetch.STATES
    if (e.event === fulfilled)
        console.log(e.payload)
})

// The values are stored in the actionStore 
if (!store.actionStore.simple_fetch.store.pending)
    store.actions.simple_fetch('some_text.txt')
```

##### [SocketStore](https://doc.esdoc.org/github.com/T4rk1n/tarkjs/)

A web socket that store a number of messages in a deque and dispatch events to subscribers.

```javascript
import { SocketStore } from 'tarkjs'

const socket = new SocketStore('ws://somesocket/', {
    transformMessage: (data) => JSON.parse(data),
    capacity: 10,
    socketName: 'somesocket'
})

socket.subscribe((e) => {
    console.log(e.payload.data)
})

socket.onOpen = () => socket.send(JSON.stringify({payload: 'Hello socket'}))

socket.start()
```

### Documentation

[Full documentation](https://doc.esdoc.org/github.com/T4rk1n/tarkjs/)
