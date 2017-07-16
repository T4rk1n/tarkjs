/**
 * Created by T4rk on 6/30/2017.
 */

import { promiseWrap } from '../extensions/prom-extensions'
import { objCopy } from '../extensions/obj-extensions'

/**
 * Simple object with event type and optional payload.
 * @typedef {Object} TEvent
 * @property {string} event
 * @property {*} [payload]
 */

/**
 * EventBus is an event dispatcher that wraps handlers in promises.
 * Used to replace the custom event of the dom in any setting
 * since it is pure vanilla js.
 * @example
 * const bus = new EventBus()
 * const handle = (payload) => {
 *      console.log(`Hello ${payload}`)
 * }
 * bus.addEventHandler('hello', handle)
 * bus.dispatch({event: 'hello', payload: 'bob'}) // prints Hello bob
 */
export class EventBus {
    constructor() {
        this._handlers = {}
    }

    /**
     * Add an handler function to an event handler list.
     * @param {string} event
     * @param {function} handler
     */
    addEventHandler(event, handler) {
        const handlers = this._handlers[event] || []
        handlers.push(handler)
        this._handlers[event] = handlers
    }

    //noinspection JSCommentMatchesSignature,JSValidateJSDoc
    /**
     * Dispatch the event to all the handlers in the order they were added.
     * Handlers receives the payload as param and can cancel the next ones.
     * @param {TEvent} param
     * @return {CancelablePromise}
     */
    dispatch({event, payload}) {
        let canceled = false
        const cancel = () => canceled = true
        const p = promiseWrap(() => {
            const handlers = this._handlers[event]
            if (!handlers || handlers.length < 1) return
            let i = 0
            while (i < handlers.length && !canceled) {
                handlers[i]({event, payload, cancel})
                i++
            }
            return !canceled
        }, {rejectNull: true, nullMessage: `Dispatch ${event} was canceled`})
        p.cancel = cancel
        return p
    }

    /**
     * Remove the handler.
     * @param {string} event
     * @param {function} handler
     */
    removeEventHandler(event, handler) {
        // TODO assure the event is not currently dispatching / cancel.
        const handlers = this._handlers[event]
        if (!handlers) return
        this._handlers[event] = handlers.filter(h => h !== handler)
    }
}

/**
 * @typedef {TEvent} ValueChangedEvent
 * @property {{oldValue: *, newValue: *}} payload
 */

/**
 * @param {string} key
 * @param {?string} prefix
 * @return {string}
 */
export const valueChanged = (key, prefix=null) => `${prefix ? `${prefix}_`: ''}${key}_value_changed`

/**
 * Wraps an object properties to dispatch a value_changed event on the setter.
 * The dispatched event key is `${key}_value_changed`.
 *
 * Watch out to not set the value again in the event callbacks otherwise there could be
 * circular madness.
 * @param {Object} obj The obj to modify. Will use _data property to hold the values.
 * @param {EventBus} eventBus The event bus to dispatch events.
 * @param {Object} [options={prefix: undefined}]
 * @return {Object}
 * @throws {TypeError} if fail to wraps a property, should not happen if using plain objects.
 * @example
 * const e = changeNotifier({hello: 'hello'})
 * e.hello = 'hi'
 * // dispatched event {event: 'hello_value_changed', payload: {newValue: 'hi', oldValue: 'hello'}}
 */
export const changeNotifier = (obj, eventBus, options={}) => {
    const { prefix } = options
    const notifier = {}
    notifier._data = objCopy(obj)
    Object.keys(obj).filter(f => obj.hasOwnProperty(f)).reduce((a, k) => {
        Object.defineProperty(notifier, k, {
            set: (value) => {
                const oldValue = notifier._data[k]
                notifier._data[k] = value
                eventBus.dispatch({
                    event: valueChanged(k, prefix),
                    payload: {newValue: value, oldValue}
                })
            },
            get: () => notifier._data[k]
        })
    }, notifier)
    return notifier
}


