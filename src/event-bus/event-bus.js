/**
 * Created by T4rk on 6/30/2017.
 */

import { promiseWrap } from '../prom'

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
        promiseWrap(handle)
    }

    /**
     * Remove the handler.
     * @param {string} event
     * @param {function} handler
     */
    removeEventHandler(event, handler) {
        // TODO assure the event is not currently dispatching.
        const handlers = this._handlers[event]
        if (!handlers) return
        this._handlers[event] = handlers.filter(h => h !== handler)
    }
}
