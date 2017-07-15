/**
 * Created by T4rk on 7/12/2017.
 */

import { EventBus, valueChanged, changeNotifier } from '../event-bus/event-bus'
import { toCancelable } from '../prom'
import { objMapReducer } from '../extensions/obj-extensions'
import { Deque } from '../containers/deque'

const fulfilled = (action) => `${action}_fulfilled`
const rejected = (action) => `${action}_rejected`
const pending = (action) => `${action}_pending`

/**
 * Create an object with all the states of a promise.
 * @param {string} action
 * @return {{base: string, fulfilled: string, rejected: string, pending: string}}
 */
export const createPromiseStates = (action) => ({
    base: action,
    fulfilled: fulfilled(action),
    rejected: rejected(action),
    pending: pending(action)
})

/**
 * Wrap a promise to send events on success or failure.
 *
 * Events sent:
 * - `${action}_pending` no payload
 * - `${action}_fulfilled` payload {value}
 * - `${action}_rejected` payload {error}
 * @param {!EventBus} eventBus
 * @param {!string} action
 * @param {!Promise} promise
 */
export const statefulPromise = (eventBus, action, promise) => {
    eventBus.dispatch({event: pending(action)})
    promise.then(
        value => eventBus.dispatch({event: fulfilled(action), payload: value})
    ).catch(
        error => eventBus.dispatch({event: rejected(action), payload: error})
    )
}

/**
 * A function that returns a promise
 * @typedef {function} promiseAction
 * @param {?*} options
 * @return {!Promise}
 */

/**
 * @example
 * import { PromiseStore,  EventBus, fetchRequest } from 'tarkjs'
 *
 * const eventBus = new EventBus()
 * const store = new PromiseStore({fetch_text: (url) => fetchRequest(url)}, eventBus)
 * const elem = document.getElementById('text-result')
 *
 * // using subscribe
 * store.subscribe('fetch_text', (e) => {
 *     if (e.event === 'fetch_text_result_value_changed'))
 *         elem.innerHTML = e.payload.newValue
 * })
 *
 * // using the promise state events
 * eventBus.addEventHandler('fetch_text_fulfilled', (e) => elem.innerHTML = e.payload)
 *
 * store.actions.fetch_text('text.txt')
 *
 */
export class PromiseStore {
    /**
     * @param {Object} actions
     * @param {?EventBus} eventBus
     */
    constructor(actions, eventBus=null) {
        this._eventBus = eventBus || new EventBus()
        const actionKeys = Object.keys(actions)
        /**
         * Centralized stores
         * @type {Object}
         */
        this.actionStore = actionKeys.map(k => [k, {
            store: changeNotifier({
                result: null,
                pending: false,
                rejected: false,
                fulfilled: false,
                error: null
            }, this._eventBus, {prefix: k}),
            subscribe: (sub) => [
                'result', 'pending', 'rejected', 'fulfilled', 'error'
            ].forEach(i => this._eventBus.addEventHandler(valueChanged(i, k), sub)),
            STATES: createPromiseStates(k)
        }]).reduce(objMapReducer, {})

        /**
         * The actions as direct function calls.
         * Each action key will have a function with one optional param that returns a CancelablePromise.
         * @type {Object}
         */
        this.actions = actionKeys.reduce((m, k) => {
            /**
             * Wrapped promise call.
             * @param [options]
             * @return {CancelablePromise}
             */
            m[k] = (options={}) =>  {
                const prom = toCancelable(actions[k](options))
                statefulPromise(this._eventBus, k, prom.promise)
                return prom
            }
            return m
        }, {})

        // Handle the states changes.
        actionKeys.forEach(k => {
            const store = this.actionStore[k].store
            this._eventBus.addEventHandler(fulfilled(k), (event) => {
                store.fulfilled = true
                store.result = event.payload
                store.pending = false
            })
            this._eventBus.addEventHandler(pending(k), (_) => {
                store.pending = true
                store.rejected = false
                store.fulfilled = false
                store.error = null
            })
            this._eventBus.addEventHandler(rejected(k), (event) => {
                store.pending = false
                store.rejected = true
                store.error = event.payload
            })
        })
    }

    /**
     * Subscribe to a store value change event.
     * @param {string} action
     * @param {function} sub
     */
    subscribe(action, sub) {
        this.actionStore[action].subscribe(sub)
        const states = [fulfilled(action), pending(action), rejected(action)]
        states.forEach(s  => this._eventBus.addEventHandler(s, sub))
    }
}

/**
 * Options for the {@link SocketStore#constructor}.
 * @typedef {Object} SocketStoreOptions
 * @property {?EventBus} [eventBus=null] The eventBus to dispatch events to, if null instantiate a new one.
 * @property {?string} [socketName=null] The name of the socket, if null take the url
 * @property {Array} [protocols=[]] socket protocols
 * @property {boolean} [start=false] Start the socket on initialization.
 * @property {int} [capacity=100] The number of message to keep in the store (FIFO).
 * @property {function(err:*)} [onError] socket event handler
 * @property {function(e:*)} [onOpen] socket event handler
 * @property {function(e:*)} [onClose] socket event handler
 * @property {function(data:*)} [transformMessage] Transform the message before inserting the data in the store
 */

/**
 * @type {SocketStoreOptions}
 */
const defaultSocketStoreOptions = {
    eventBus: null, protocols: [], start: false, capacity: 100, socketName: null,
    onOpen: (e) => {},
    onError: (err) => {console.log(err)},
    onClose: (e) => {},
    transformMessage: (data) => data
}

const formatMessageReceived = (socketName) => `${socketName}_message_received`

/**
 * Store the messages received by a socket.
 */
export class SocketStore {
    /**
     * @param {!string} url
     * @param {SocketStoreOptions} [options]
     */
    constructor(url, options=defaultSocketStoreOptions) {
        const {
            eventBus, protocols, start, onOpen, capacity, onError, onClose, transformMessage, socketName
        } = {...defaultSocketStoreOptions, ...options}
        this._eventBus = eventBus || new EventBus()
        /**
         * The name of the socket, if null take the url
         * @type {string}
         */
        this.socketName = socketName || url
        /**
         * Notifies of changes with event `${socket}_messages_value_changed`
         * @type {{messages: Deque}}
         */
        this.store = changeNotifier({messages: new Deque({capacity})}, this._eventBus, {prefix: this.socketName})
        /**
         * @type {string}
         */
        this.url = url
        /**
         * @type {Array<string>}
         */
        this.protocols = protocols
        /**
         * @type {WebSocket}
         * @private
         */
        this._socket = null
        /**
         * Socket event handler, must set before start.
         * @type {function(e: *)}
         */
        this.onOpen = onOpen
        /**
         * Socket event handler, must set before start.
         * @type {function(e: *)}
         */
        this.onError = onError
        /**
         * Socket event handler, must set before start.
         * @type {function(e: *)}
         */
        this.onClose = onClose
        /**
         * Transform the message before inserting the data in the store
         * @type {function(data: *)}
         */
        this.transformMessage = transformMessage
        if (start) this.start()
    }

    /**
     * Initialize the socket and its handlers.
     */
    start() {
        //noinspection JSCheckFunctionSignatures
        this._socket = new WebSocket(this.url, this.protocols)
        this._socket.onopen = this.onOpen
        this._socket.onerror = this.onError
        this._socket.onclose = this.onClose
        this._socket.onmessage = (event) => {
            const data = this.transformMessage(event.data)
            // emits change events - remove the notifier as it is redundant ?
            this.store.messages = this.store.messages.pushBack(data)
            this._eventBus.dispatch({
                event: formatMessageReceived(this.socketName),
                payload: {data, store: this.store.messages}
            })
        }
    }

    /**
     * Send a message to the server.
     * @param {string} message
     */
    send(message) {
        if (!this._socket || this._socket.readyState !== WebSocket.OPEN) throw new Error('Socket not open')
        this._socket.send(message)
    }

    /**
     * Close the internal socket.
     * @param {{code: number, reason: string}} [options={code: 1000, reason: ''}] optional reason
     */
    close(options={code: 1000, reason: ''}) {
        if (this._socket && this._socket.readyState === WebSocket.OPEN) this._socket.close(options.code, options.reason)
    }

    /**
     * Subscribe to change in the store.
     * Only one event is subscribed to `${socketName}_message_received`
     * @param {function(e: TEvent)} sub
     */
    subscribe(sub) {
        this._eventBus.addEventHandler(formatMessageReceived(this.socketName), sub)
    }
}
