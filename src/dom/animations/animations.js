import { getOffset, getFontSize } from '../dom-manipulations'

/**
 * @typedef {Object} AnimationOptions
 * @property {number} [division=100] number of frames to execute.
 */

/**
 * @typedef {AnimationOptions} FadeInOptions
 * @property {string} [display]
 */

/**
 *
 * @type {FadeInOptions}
 */
const defaultFadeInOptions = {
    display:'block', division:100
}

/**
 * Progressively fade in an element in n frame.
 * @param {!Element} elem
 * @param {?FadeInOptions} [options={display: 'block', division: 60}]
 * @return {CancelablePromise}
 */
export const fadeIn = (elem, options=defaultFadeInOptions) => {
    const { display, division } = {...defaultFadeInOptions, ...options }
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
 *
 * @type {AnimationOptions}
 */
const defaultFadeOutOptions = {
    division: 100
}

/**
 * Progressively fade out an element in n frame.
 * @param {!Element} elem
 * @param {?AnimationOptions} [options]
 * @return {CancelablePromise}
 */
export const fadeOut = (elem, options=defaultFadeOutOptions) => {
    const { division } = {...defaultFadeOutOptions, ...options}
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
 * @property {?number} height
 * @property {?number} width
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
 * @param {?MoveOutOptions} [options={height: 100, width: 100, division: 100}]
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
 *
 * @type {AnimationOptions}
 */
const defaultDeflateOptions = {
    division: 100
}

/**
 * Deflate an element, making it disappear in n frames.
 * @param {!Element} elem
 * @param {?AnimationOptions} [options]
 * @return {CancelablePromise}
 */
export const deflate = (elem, options=defaultDeflateOptions) => {
    const { division } = {...defaultDeflateOptions, ...options}
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