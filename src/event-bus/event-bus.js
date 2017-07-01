/**
 * Created by T4rk on 6/30/2017.
 */

import { promiseWrap } from '../prom'
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
     * Handlers are wrapped in recursive tail promises.
     * @param {TEvent} param
     */
    dispatch({event, payload}) {
        // TODO make the event cancelable.
        const handlers = this._handlers[event]
        if (!handlers || handlers.length < 1) return
        let i = 0
        const handle = () => {
            const h = handlers[i]
            h(payload)
            i++
            if (i < handlers.length) promiseWrap(handle)
        }
        return promiseWrap(handle)
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
 * Wraps an object properties to dispatch a value_changed event on the setter.
 * The dispatched event key is `${key}_value_changed`.
 * @param {Object} obj The obj to modify. Will use _data property to hold the values.
 * @param {EventBus} eventBus The event bus to dispatch events.
 * @return {Object}
 * @throws {TypeError} if fail to wraps a property, should not happen if using plain objects.
 * @example
 * const e = changeNotifier({hello: 'hello'})
 * e.hello = 'hi'
 * // dispatched event {event: 'hello_value_changed', payload: {newValue: 'hi', oldValue: 'hello'}}
 */
export const changeNotifier = (obj, eventBus) => {
    obj._data = objCopy(obj)
    Object.keys(obj).filter(f => obj.hasOwnProperty(f) && f !== '_data').forEach(k => {
        Object.defineProperty(obj, k, {
            set: (value) => {
                const oldValue = obj._data[k]
                obj._data[k] = value
                eventBus.dispatch({event: `${k}_value_changed`, payload: {newValue: value, oldValue}})
            },
            get: () => obj._data[k]
        })
    })
    return obj
}
