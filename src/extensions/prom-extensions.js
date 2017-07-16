/**
 * Created by T4rk on 6/19/2017.
 */

/**
 * @typedef {Object} CancelablePromise
 * @property {Promise} promise
 * @property {function} cancel cancel the promise.
 */

/**
 * Async Promise function wrap
 *
 * Four options may happen:
 * - requestIdleCallback for chrome >= 47 && opera >= 34
 * - setImmediate for ie >= 10, Edge, PhantomJS
 * - requestAnimationFrame if available
 * - synchronous execution in worst case scenario
 *
 * @param {function} func the return of the function will be resolved.
 * @param {?Object} [options={rejectNull: false, timeout: null}]
 * @return {CancelablePromise}
 */
export const promiseWrap = (func, options={rejectNull: false, timeout: null}) => {
    let canceled = false, reqId = -1
    const { rejectNull, timeout } = options
    const promise = new Promise((resolve, reject) => {
        const handle = () => {
            let result
            try {
                result = func()
            } catch (e) {
                return reject(e)
            }
            if (rejectNull && !result) reject('Expected promise result is null')
            else if (canceled) reject('Promise was canceled')
            else resolve(result)
        }
        if (window.requestIdleCallback) reqId = window.requestIdleCallback(handle, {timeout})   // chrome >= 47 && opera >= 34
        else if (window.setImmediate) reqId = window.setImmediate(handle)                       // ie >= 10, Edge, PhantomJS
        else if (window.requestAnimationFrame) reqId = window.requestAnimationFrame(handle)     // Some kind of async
        else handle() // no async fail.
    })
    const cancel = () => canceled = true
    return {
        promise,
        cancel,
        reqId
    }
}

/**
 * Wrap a promise as cancelable.
 * @param  {!Promise} promise
 * @param {?int} timeout
 * @return {CancelablePromise}
 */
export const toCancelable = (promise, timeout=null) => {
    let canceled = false
    const dt = new Date()
    const wrap = new Promise((resolve, reject) => {
        promise.then(value => {
            if (canceled) reject('Promise was canceled')
            else if (timeout && new Date() - dt >= timeout) reject('Timed-out')
            else resolve(value)
        }).catch(err => reject(err))
    })
    return {
        promise: wrap,
        cancel() { canceled = true }
    }
}

