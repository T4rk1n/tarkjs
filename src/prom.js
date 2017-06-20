/**
 * Created by T4rk on 6/19/2017.
 */

/**
 * Wrap a function into a cancelable promise.
 * @param func {function}
 * @param options {{}}
 * @return {{promise: Promise, cancel: (function())}}
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
