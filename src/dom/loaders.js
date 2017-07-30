/**
 * Created by T4rk on 7/29/2017.
 */

import { createElement, getHead } from './dom-manipulations'
import { objExtend } from '../extensions/obj-extensions'

/**
 * @typedef {Object} LoadingOptions
 * @property {int} [timeout=2000]
 */

/**
 * @type {LoadingOptions}
 */
const defaultLoadingOptions = {
    timeout: 2000
}

/**
 * Load an image.
 * @param {string} url
 * @return {CancelablePromise}
 */
export const loadImage = (url) => {
    let cancel=()=>{}
    const promise = new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = (e) => reject(e)
        cancel = () => {
            img.src = ''
            reject({error: 'canceled', message: `Loading of ${url} was canceled`})
        }
        img.src = url
    })
    return {
        promise,
        cancel
    }
}

/**
 * Load a style into the head.
 * @param {!string} styleId unique id to only load once.
 * @param {!string} cssFile file to load.
 * @param {LoadingOptions} [options]
 * @return {CancelablePromise}
 */
export const loadStyle = (styleId, cssFile, options=defaultLoadingOptions) =>  {
    let cancel = ()=>{}, loaded = false, timeoutId
    const { timeout } = objExtend({}, defaultLoadingOptions, options)
    const promise = new Promise((resolve, reject) => {
        const onload = () => {
            loaded = true
            clearTimeout(timeoutId)
            resolve()
        }

        const style =  createElement(getHead(), styleId, {
            attributes: {
                rel: 'stylesheet',
                type: 'text/css',
                href: cssFile,
                media: 'all',
            },
            elementType: 'link',
            onload
        })

        timeoutId = setTimeout(() => {
            style.href = ''
            reject({error: ''})
        }, timeout)

        cancel = () => {
            if (!loaded) {
                style.href = ''
            } else {
                style.setAttribute('disabled', 'disabled')
            }
            clearTimeout(timeoutId)
            reject({error: 'canceled', message: `Loading of style ${styleId} was canceled` })
        }
    })
    return {
        promise,
        cancel
    }
}

/**
 * Append a script to the body.
 * @param {!string} scriptId unique id to only load once.
 * @param {!string} src file to load.
 * @param {LoadingOptions} [options]
 * @return {CancelablePromise}
 */
export const loadScript = (scriptId, src, options=defaultLoadingOptions) => {
    let cancel = () => {}, loaded = false, timeoutId
    const { timeout } = objExtend({}, defaultLoadingOptions, options)
    const promise = new Promise((resolve, reject) => {
        const onload = () => {
            loaded = true
            clearTimeout(timeoutId)
            resolve()
        }

        const script = createElement(document.querySelector('body'), scriptId, {
            elementType: 'script',
            attributes: {src},
            onload
        })

        timeoutId = setTimeout(() => {
            script.src = ''
            reject({error: 'timeout', message: `Loading of script ${scriptId} timed out after ${timeout}ms.`})
        }, timeout)

        cancel = () => {
            if (!loaded) {
                script.src = ''
                clearTimeout(timeoutId)
                reject({error: 'canceled', message: `Load script ${scriptId} was canceled`})
            }
        }
    })
    return {
        promise,
        cancel
    }
}
