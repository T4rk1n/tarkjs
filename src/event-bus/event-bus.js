/**
 * Created by T4rk on 6/30/2017.
 */

import { promiseWrap } from '../extensions/prom-extensions'
import {objCopy, objExtend } from '../extensions/obj-extensions'
import {arrIncludes, arrMerge} from '../extensions/arr-extensions'
import { TObject } from '../containers/tobject'

/**
 * Simple object with event type and optional payload.
 * @typedef {Object} TEvent
 * @property {string} event
 * @property {*} [payload]
 */

/**
 * Custom event object dispatched by the EventBus.
 * @typedef {TEvent} TEventHandlerParams
 * @property {function} cancel abort the next handlers from dispatching.
 * @property {Array} acc Accumulator of the return values of the previous handlers.
 * @property {number} i iterator of the handler.
 * @property {number} end length of the handlers.
 */

/**
 * @typedef {function} TEventHandler
 * @param {!TEventHandlerParams} params
 */

/**
 * EventBus is an event dispatcher that wraps handlers in promises.
 *
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
        this._handlers = new TObject()
    }

    /**
     * Add an handler function to an event handler list.
     * @param {string|RegExp} event If regex it will match events.
     * @param {TEventHandler} handler
     * @param {boolean} [once=false] For once to work properly, wait for a dispatch to finish before sending a new one.
     */
    addEventHandler(event, handler, once=false) {
        const isRegex = event instanceof RegExp
        const h = this._handlers.opt(event, { isRegex, handlers: [], original: event })
        if (!arrIncludes(h.handlers, handler)) {
            if (once) {
                const _wrap = (e) => {
                    const ret = handler(e)
                    this.removeEventHandler(event, _wrap)
                    return ret
                }
                h.handlers.push(_wrap)
            } else {
                h.handlers.push(handler)
            }
            this._handlers[event] = h
        }
    }

    //noinspection JSCommentMatchesSignature,JSValidateJSDoc
    /**
     * Dispatch a {@link TEventHandlerParams} to all the concerned handlers
     * @param {TEvent} param
     * @return {CancelablePromise} canceling a dispatch will prevent next handler from executing.
     */
    dispatch({event, payload}) {
        let canceled = false,  curProm
        const cancel = () => {
            canceled = true
        }
        const promise = new Promise((resolve, reject) => {
            const handlers = this.findHandlers(event)
            const end = handlers.length
            if (!handlers || handlers.length < 1) return reject({
                error: 'missing_handler',
                message:`No handler to dispatch ${event}`})
            let i = 0
            const acc = []
            const handle = (value) => {
                if (canceled)
                    return reject({
                        error: 'canceled',
                        message: `Dispatch ${event} was canceled after ${i} handlers.`})

                if (value) {
                    acc.push(value)
                }

                if (i < end) {
                    curProm = promiseWrap(() => {
                        const r = handlers[i]({event, payload, cancel, acc, i, end})
                        i++
                        return r
                    })
                    curProm.promise.then(handle, reject)
                }
                else {
                    resolve({event, acc, dispatched: i})
                }
            }
            handle()
        })
        return {
            promise,
            cancel
        }
    }

    /**
     * Remove the handler.
     * @param {string} event
     * @param {function} handler
     */
    removeEventHandler(event, handler) {
        const h = this._handlers[event]
        if (!h) return
        this._handlers[event].handlers = h.handlers.filter(h => h !== handler)
    }

    /**
     * Merge the handlers for a event.
     * @param {string} event Event to handlers for.
     */
    findHandlers(event) {
        return arrMerge([], ...this._handlers.items()
            .filter(([k,{ isRegex, original }]) => isRegex ? original.test(event): k === event)
            // eslint-disable-next-line
            .map(([_, {handlers}]) => handlers))
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


// eslint-disable-next-line no-console
const valueChangedOptions = { onDispatchError: (e) => console.log(e) }

/**
 * Wraps an object properties to dispatch a value_changed event on the setter.
 * The dispatched event key is `${key}_value_changed`.
 *
 * Watch out to not set the value again in the event callbacks otherwise there could be
 * circular madness.
 * @param {Object} obj The obj to modify. Will use _data property to hold the values.
 * @param {EventBus} eventBus The event bus to dispatch events.
 * @param {Object} [options={}]
 * @return {Object}
 * @throws {TypeError} if fail to wraps a property, should not happen if using plain objects.
 * @example
 * const e = changeNotifier({hello: 'hello'})
 * e.hello = 'hi'
 * // dispatched event {event: 'hello_value_changed', payload: {newValue: 'hi', oldValue: 'hello'}}
 */
export const changeNotifier = (obj, eventBus, options=valueChangedOptions) => {
    const { prefix, onDispatchError } = objExtend({}, valueChangedOptions, options)
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
                }).promise.catch(onDispatchError)
            },
            get: () => notifier._data[k]
        })
    }, notifier)
    return notifier
}

