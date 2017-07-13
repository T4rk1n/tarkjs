/**
 * Created by T4rk on 7/12/2017.
 */

import { EventBus, valueChanged, changeNotifier } from '../event-bus/event-bus'
import {toCancelable} from "../prom";
import {objMapReducer} from "../extensions/obj-extensions";

const fulfilled = (action) => `${action}_fulfilled`
const rejected = (action) => `${action}_rejected`
const pending = (action) => `${action}_pending`

/**
 *
 * @param {Object} action
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
        value => eventBus.dispatch({event: fulfilled(action), payload: {value}})
    ).catch(
        error => eventBus.dispatch({event: rejected(action), payload: {error}})
    )
}

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
     * @param {Array<Function>} actions must return a {Promise}
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
                'result', 'pending', 'rejected', 'fulfilled'
            ].forEach(i => this._eventBus.addEventHandler(valueChanged(k, i), sub))
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
    }
}
