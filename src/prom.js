/**
 * Created by T4rk on 6/19/2017.
 */

/**
 * @typedef {Object} CancelablePromise
 * @property {Promise} promise
 * @property {function} cancel
 */

/**
 * Wrap a function into a cancelable promise.
 * @param {!function} func
 * @param {?Object} options
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
    return {
        promise,
        cancel() { canceled = true }
    }
}
