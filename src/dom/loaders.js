/**
 * Created by T4rk on 7/29/2017.
 */

import { createElement, getHead } from './dom-manipulations'
import { objExtend } from '../extensions/obj-extensions'
import { arrRange } from '../extensions/arr-extensions'

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
 * Load images in a directory one by one until there is an error.
 *
 * @param {string} baseurl
 * @param {string} extension
 * @param {number} start
 * @return {CancelablePromise} promise resolve Array<Image>
 */
export const loadImageChain = (baseurl, extension, start) => {
    let i = start, cancel = () => {}, canceled = false, cur
    const images = []
    const promise = new Promise((resolve, reject) => {
        const onStop = (e) => {
            const { error } = e
            if (error === 'canceled') resolve(images)
            else reject(e)
        }
        const loadMore = (value) => {
            if (value) {
                images.push(value)
                i++
            }
            if (!canceled) {
                cur = loadImage(`${baseurl}${i}.${extension}`)
                cur.promise.then(loadMore, onStop)
            }
        }
        cancel = () => {
            if (cur) cur.cancel()
        }

        loadMore()
    })
    return {
        promise,
        cancel
    }
}

/**
 *
 * @param {string} baseurl
 * @param {string} extension
 * @param {number} start
 * @param {number} stop
 * @return {CancelablePromise}
 */
export const loadAllImages = (baseurl, extension, start, stop) => {
    let cancel = () => {}
    const images = []
    const onLoadImage = (img) => images.push(img)
    const promise = new Promise((resolve, reject) => {
        const imagesPromises = arrRange(start, stop).map(i => {
            const p = loadImage(`${baseurl}${i}.${extension}`)
            p.promise.then(onLoadImage, reject)
            return p
        })
        cancel = () => {
            imagesPromises.forEach(p => p.cancel())
        }
        Promise.all(imagesPromises.map(p => p.promise)).then(() => resolve(images), reject)
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
