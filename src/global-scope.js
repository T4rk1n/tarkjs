/**
 * Created by T4rk on 7/29/2017.
 */

/**
 * global object filler, either global, window or self.
 */
export const globalScope = (() => {
    // eslint-disable-next-line no-undef
    const glob = typeof module !== 'undefined' && module.exports ? global
        : typeof window !== undefined ? window : typeof self !== undefined ? self : {}

    const acb = {
        asyncCallback: (func) => setTimeout(func, 0),
        clearCallback: (callId) => clearTimeout(callId),
        scope: glob
    }

    const setACB = (cb, clear) => {
        acb.asyncCallback = (func) => cb(func)
        acb.clearCallback = (callId) => clear(callId)
    }

    if (glob.requestIdleCallback) setACB(glob.requestIdleCallback, glob.cancelIdleCallback)
    else if (glob.setImmediate) setACB(glob.setImmediate, glob.clearImmediate)

    return Object.freeze ? Object.freeze(acb) : acb
})()

