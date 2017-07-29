import { getOffset, getFontSize } from '../dom-manipulations'
import { objExtend } from '../../extensions/obj-extensions'

/**
 * @typedef {Object} AnimationOptions
 * @property {number} [division=100] number of frames to execute.
 */

/**
 *
 * @type {AnimationOptions}
 */
const defaultAnimationOptions = {
    division: 100
}

/**
 * @typedef {AnimationOptions} FadeInOptions
 * @property {string} [display='block']
 */

/**
 *
 * @type {FadeInOptions}
 */
const defaultFadeInOptions = {
    ...defaultAnimationOptions, display: 'block',
}

/**
 * Progressively fade in an element in n frame.
 * @param {!Element} elem
 * @param {FadeInOptions} [options={display: 'block', division: 60}]
 * @return {CancelablePromise}
 */
export const fadeIn = (elem, options=defaultFadeInOptions) => {
    const { display, division } = objExtend({}, defaultFadeInOptions, options)
    elem.style.opacity = 0
    elem.style.display = display
    const increment = 1 / division
    let canceled = false
    const promise = new Promise((resolve, reject) => {
        const fade = () => {
            if (canceled) return reject({error: 'canceled', message: 'fadeIn was canceled'})
            let value = parseFloat(elem.style.opacity) + increment
            if (value <= 1) {
                elem.style.opacity = value
                requestAnimationFrame(fade)
            } else {
                resolve(division)
            }
        }
        fade()
    })
    return { promise, cancel: () => canceled = true }
}


/**
 * Progressively fade out an element in n frame.
 * @param {!Element} elem
 * @param {AnimationOptions} [options]
 * @return {CancelablePromise}
 */
export const fadeOut = (elem, options=defaultAnimationOptions) => {
    const { division } = {...defaultAnimationOptions, ...options}
    elem.style.opacity = 1
    const increment = 1 / division
    let canceled = false
    const promise = new Promise((resolve, reject) => {
        const fade = () => {
            if (canceled) return reject({error: 'canceled', message: 'fadeOut was canceled'})
            if ((elem.style.opacity -= increment) <= 0) {
                elem.style.display = 'none'
                resolve()
            } else {
                requestAnimationFrame(fade)
            }
        }
        fade()
    })
    return { promise, cancel: () => canceled = true }
}

/**
 * @typedef {AnimationOptions} MoveOutOptions
 * @property {number} [height=100]
 * @property {number} [width=100]
 */

/**
 *
 * @type {MoveOutOptions}
 */

const defaultMoveOptions = {
    height: 100, width: 100, division: 100
}

/**
 * Move an element for height and width value.
 * @param {!Element} elem
 * @param {MoveOutOptions} [options={height: 100, width: 100, division: 100}]
 * @return {CancelablePromise}
 */
export const moveOut = (elem, options=defaultMoveOptions) => {
    const { height, width, division } = {...defaultMoveOptions, ...options}
    const moveHeight = height / division
    const moveWidth = width / division
    const offsets = getOffset(elem)
    const destinationX = offsets.left + width
    const destinationY = offsets.top + height
    elem.style.position = 'absolute'
    let canceled = false
    const promise = new Promise((resolve, reject) => {
        const move = () => {
            if (canceled) return reject({error: 'canceled', message: 'fadeOut was canceled'})
            let endX = false, endY = false
            const { left, top } = getOffset(elem)
            if (left < destinationX)
                elem.style.left = left + moveWidth + 'px'
            else
                endX = true
            if (top < destinationY)
                elem.style.top = top + moveHeight + 'px'
            else
                endY = true
            if (!endX || !endY)
                requestAnimationFrame(move)
            else
                resolve()
        }
        move()
    })
    return { promise, cancel: () => canceled = true}
}


/**
 * Deflate an element, making it disappear in n frames.
 * @param {!Element} elem
 * @param {AnimationOptions} [options]
 * @return {CancelablePromise}
 */
export const deflate = (elem, options=defaultAnimationOptions) => {
    const { division } = {...defaultAnimationOptions, ...options}
    const decrementX = Math.ceil(elem.offsetWidth / division)
    const decrementY = Math.ceil(elem.offsetHeight / division)
    const decrementFont = Math.ceil(getFontSize(elem) / division)
    elem.style.height = elem.offsetHeight + 'px'
    let canceled = false
    const promise = new Promise((resolve, reject) => {
        const defl = () => {
            if (canceled) return reject({error: 'canceled', message: 'fadeOut was canceled'})
            let endX = false, endY = false
            if (elem.offsetWidth > 0) {
                elem.style.width = (elem.offsetWidth - decrementX) + 'px'
            } else {
                endX = true
            }
            if (elem.offsetHeight > 0) {
                elem.style.height = (elem.offsetHeight - decrementY) + 'px'
            } else {
                endY = true
            }
            elem.style.fontSize = (getFontSize(elem) - decrementFont) + 'px'
            if (!endX || !endY) {
                requestAnimationFrame(defl)
            } else {
                resolve()
            }
        }
        defl()
    })
    return { promise, cancel: () => canceled = true }
}


/**
 * First param given to {@link AnimateAction} function call.
 * @typedef {Object} AnimationPayload
 * @property {?number} last if null, first call
 * @property {?number} current timestamp from requestAnimationFrame
 * @property {number} i number of times the animation ran.
 */

/**
 * @typedef {Object} AnimateAction
 * @property {!function(t: AnimationPayload, ...args: *):boolean} animation callback to requestAnimationFrame
 * @property {Array<*>} [args]
 */


/**
 * @typedef {Object} AnimateOptions
 * @property {boolean} [single=false]
 * @property {number} [repeat=100]
 * @property {boolean} [infinite=false] if infinite you must return true from a AnimateAction
 */

/**
 *
 * @type {AnimateOptions}
 */
const defaultAnimateOptions = {
    single: false, repeat: 100, infinite: false
}

/**
 *
 * @param {!Array<AnimateAction>} animations
 * @param {AnimateOptions} [options]
 * @return {CancelablePromise}
 */
export const animate = (animations, options=defaultAnimateOptions) => {
    let canceled = false, ts
    const { single, repeat, infinite } = objExtend({}, defaultAnimateOptions, options)
    const promise = new Promise((resolve, reject) => {
        if (infinite && !single) return reject({
            error: 'invalid_option',
            message: 'Infinite can only be true with single.'
        })
        let i = 0, handle
        const end = single ? repeat : animations.length
        const first = animations[0]
        handle = (timestamp) => new Promise((res, rej) => {
            if (canceled) rej({error: 'canceled'})
            else if (!infinite && i >= end) resolve(i)
            else {
                const { animation, args } = single ? first : animation[i]
                const a = args || []
                const stop = animation({last: ts, current: timestamp, i}, ...a)
                ts = timestamp
                if (!stop) {
                    i++
                    res()
                }
                else {
                    reject({error: 'animate_stop', frame: i})
                }
            }
        }).then(() => requestAnimationFrame(handle)).catch(reject)
        requestAnimationFrame(handle)
    })
    return { promise, cancel: () => canceled = true }
}
