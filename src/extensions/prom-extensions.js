/**
 * Created by T4rk on 6/19/2017.
 */

import { objExtend } from './obj-extensions'
import { globalScope } from '../global-scope'

/**
 * A promise may be canceled:
 * - before it's execution.
 * - after it resolves, rejecting instead.
 * - during a step of a promise chain, stopping propagation.
 * @typedef {Object} CancelablePromise
 * @property {Promise} promise
 * @property {function} cancel cancel the promise.
 */

/**
 * @typedef {Object} TError
 * @property {!string} error
 * @property {?string} message
 */

/**
 * @typedef {Object} PromiseWrapOptions
 * @property {boolean} [rejectNull=false] Reject the return value of the wrapped function if null.
 * @property {string} [nullMessage=''] Message to include in the null_result error.
 * @property {Array} [args=[]] to give on the function call.
 */

/**
 * @typedef {Object} PromiseCreator
 * @property {function(args:*):Promise} creator
 * @property {Array} [promArgs] arguments to call the creator
 */

/**
 * Create a {@link PromiseCreator} from a function and it's args to be called with.
 * @param {function(args:*):Promise} creator
 * @param {Array} [args]
 * @return {PromiseCreator}
 */
export const promiseCreator = (creator, ...args) => ({
    creator,
    promArgs: args || []
})

/**
 * @type {PromiseWrapOptions}
 */
const defaultPromiseWrapOptions = {
    rejectNull: null, timeout: null, nullMessage: '', args: []
}



/**
 * Wrap a function to resolve the return value and reject errors.
 *
 * Three callback options may happen:
 * - requestIdleCallback chrome >= 47 && opera >= 34
 * - setImmediate ie >= 10, Edge, PhantomJS
 * - setTimeout(,0) rest
 *
 * Cancellation before execution if cleared else after.
 * @param {function} func the return of the function will be resolved.
 * @param {PromiseWrapOptions} [options]
 * @return {CancelablePromise}
 */
export const promiseWrap = (func, options=defaultPromiseWrapOptions) => {
    let canceled = false,
        cancel = () => {},
        reqId = -1
    const { rejectNull, nullMessage, args } = objExtend({}, defaultPromiseWrapOptions, options)
    const promise = new Promise((resolve, reject) => {
        const handle = () => {
            let result

            try { result = func(...args) }
            catch (e) { return reject(e) }

            if (canceled) return

            if (rejectNull && !result) reject({
                error:'null_result',
                message: nullMessage || 'Expected promise result is null'
            })
            else {
                if (result instanceof Promise) {
                    result.then((value) => {
                        if (!canceled) resolve(value)
                    }).catch(reject)
                } else {
                    resolve(result)
                }
            }
        }
        reqId = globalScope.asyncCallback(handle)
        cancel = () => {
            canceled = true
            globalScope.clearCallback(reqId)
            reject({
                error: 'canceled',
                message: `Promise was canceled, reqId = ${reqId}`
            })
        }
    })

    return {
        promise,
        cancel,
        reqId
    }
}

/**
 * Pre promiseWrap a function to be called later.
 * @param {function} func
 * @param {Array<*>} args
 * @param {PromiseWrapOptions} [options]
 * @return {function(): CancelablePromise}
 */
export const wrapLater = (func, args, options={}) => {
    return () => promiseWrap(func, {args, ...options})
}

/**
 * Wrap a promise as cancelable with timeout option.
 * Rejection after resolve.
 * @param  {!Promise} promise
 * @param {?int} timeout
 * @return {CancelablePromise}
 */
export const toCancelable = (promise, timeout=null) => {
    let canceled = false
    const dt = new Date()
    const wrap = new Promise((resolve, reject) => {
        promise.then(value => {
            if (canceled) reject({error: 'canceled', message: 'Promise was canceled'})
            else if (timeout && new Date() - dt >= timeout)
                reject({error: 'time_out', message: `Promise was resolved after timeout of ${timeout}`})
            else resolve(value)
        }).catch(reject)
    })
    return {
        promise: wrap,
        cancel() { canceled = true }
    }
}

/**
 * Executes a function after a delay.
 * Cancellation before execution only.
 * @param {number} delay
 * @param {function} func Executor
 * @param {*} fargs arguments given to func call
 * @return {CancelablePromise}
 */
export const delayed = (delay, func, ...fargs) => {
    let canceled = false
    const promise = new Promise((resolve, reject) => {
        setTimeout(() => {
            if (canceled) reject({
                error: 'canceled',
                message: 'Delayed execution was canceled'})
            else resolve(func(...fargs))
        }, delay)
    })
    return {
        promise,
        cancel: () => canceled = true
    }
}


/**
 * {@link chainPromises} options.
 * @typedef {Object} PromiseChainOptions
 * @property {function} [onChain] inner promise.then callback.
 * @property {function} [onError] inner promise.catch callback.
 * @property {boolean} [rejectOnError=true] reject the outer promise on inner rejection.
 */

/**
 * @type {PromiseChainOptions}
 */
const defaultChainOptions = {
    onChain: ()=>{}, onError: ()=>{}, rejectOnError: true,
}

/**
 *
 * @param {Array<PromiseCreator>} creators
 * @param {PromiseChainOptions} [options]
 * @return {CancelablePromise}
 */
export const chainPromises = (creators, options=defaultChainOptions) => {
    let canceled = false, cancel = () => canceled = true
    const { onChain, onError, rejectOnError } = objExtend({}, defaultChainOptions, options)
    const promise = new Promise((resolve, reject) => {
        let i = 0, acc = []
        const _err = (err) => {
            onError(err)
            if (rejectOnError) reject(err)
            else chain()
        }
        const chain = (value) => {
            if (value) {
                onChain(value)
                acc.push(value)
            }
            if (canceled) reject({
                error: 'canceled', message: `Promise chain was canceled after ${i} promise.`
            })
            else if (i < creators.length) {
                const { creator, promArgs } = creators[i]
                i++
                const prom = creator(...promArgs)
                prom.then(chain).catch(_err)
            }
            else resolve(acc)
        }
        chain()
    })
    return {
        promise,
        cancel
    }
}

