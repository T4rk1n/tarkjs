# tarkjs

Collection of functions and objects.

[![travis-ci](https://travis-ci.org/T4rk1n/tarkjs.svg?branch=master)](https://travis-ci.org/T4rk1n/tarkjs)
[![Test Coverage](https://codeclimate.com/github/T4rk1n/tarkjs/badges/coverage.svg)](https://codeclimate.com/github/T4rk1n/tarkjs/coverage)
[![Code Climate](https://codeclimate.com/github/T4rk1n/tarkjs/badges/gpa.svg)](https://codeclimate.com/github/T4rk1n/tarkjs/)
[![esdocs](https://doc.esdoc.org/github.com/T4rk1n/tarkjs/badge.svg)](https://doc.esdoc.org/github.com/T4rk1n/tarkjs/)

### Installation

Install with npm: `npm i -S tarkjs`

### Usage

ES6 imports.

`import * as tarkjs from 'tarkjs' `

There is no default export.

#### Custom Events and Stores

##### [EventBus](https://doc.esdoc.org/github.com/T4rk1n/tarkjs/class/src/event-bus/event-bus.js~EventBus.html)

The EventBus is a custom event dispatcher that process events to handlers 
in the order they were added. The events are cancelable by the handlers, 
stopping propagation to the next handler.

```javascript
import { EventBus, changeNotifier } from 'tarkjs'

const eventBus = new EventBus()

// Create an object that send events when it's properties are set.
const notifier = changeNotifier({message: 'hello'})

// attach an handler
eventBus.addEventHandler('message_value_changed', (e) => {
    console.log(e.newValue)
})

// send a value changed event
notifier.message = 'hi'

// Send any event 
eventBus.addEventHandler('custom_event', (e) => {
    // code...
})

eventBus.dispatch({event: 'custom_event', payload: 'hello'})
```

##### [PromiseStore](https://doc.esdoc.org/github.com/T4rk1n/tarkjs/class/src/persistance/mem-stores.js~PromiseStore.html)

Store the result and dispatch events of the promises states. 
Promises goes by three states: pending, fulfilled, rejected. Each of them generating an event 

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

#### [SeededRandom](https://doc.esdoc.org/github.com/T4rk1n/tarkjs/)

Generate numbers from a seed sequence.

```javascript
import { SeededRandom } from 'tarkjs'

const rand = new SeededRandom(3000)
const rand2 = new SeededRandom(3000)
console.log(rand.random() === rand2.random()) // true
rand.seed = 400
rand2.seed = 100 
console.log(rand.random() === rand2.random()) // false
```

### Documentation

[Full documentation](https://doc.esdoc.org/github.com/T4rk1n/tarkjs/)
