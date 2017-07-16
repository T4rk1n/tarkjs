/**
 * Created by T4rk on 6/19/2017.
 */

/**
 * @typedef {Object} CancelablePromise
 * @property {Promise} promise
 * @property {function} cancel cancel the promise.
 */

/**
 * Wrap a function into a cancelable promise.
 * @deprecated After testing, this is a blocking call so there is no point in keeping it,.
 * Use toCancelable instead, this is not cancelable.
 * @param {!function} func function to call with no params.
 * @param {?Object} [options={rejectNull: false}]
 * @return {CancelablePromise}
 */
export const promiseWrap = (func, options={rejectNull: false}) => {
    let canceled = false
    const promise = new Promise((resolve, reject) => {
        const { rejectNull } = options
        let result
        try {
            result = func()
        } catch (e) {
            return reject(e)
        }
        if (rejectNull && !result) reject('Expected promise result is null')
        else if (canceled) reject('Promise was canceled')
        else resolve(result)
    })
    const cancel = () => { canceled = true }
    return {
        promise,
        cancel
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
