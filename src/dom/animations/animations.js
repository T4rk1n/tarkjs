import { getOffset, getFontSize } from '../dom-manipulations'

/**
 * @typedef {Object} AnimationOptions
 * @property {?number} division number of frames to execute.
 * @property {?function} callback called when the animation end.
 */

/**
 * @typedef {AnimationOptions} FadeInOptions
 * @property {?string} display
 */

/**
 *
 * @type {FadeInOptions}
 */
const defaultFadeInOptions = {
    display:'block', division:100, callback: () => null
}

/**
 * Progressively fade in an element in n frame.
 * @param {!Element} elem
 * @param {?FadeInOptions} [options={display: 'block', division: 60}]
 */
export const fadeIn = (elem, options=defaultFadeInOptions) => {
    const { display, division, callback } = {...defaultFadeInOptions, ...options }
    elem.style.opacity = 0
    elem.style.display = display
    const increment = 1 / division
    const fade = () => {
        let value = parseFloat(elem.style.opacity) + increment
        if (value <= 1) {
            elem.style.opacity = value
            requestAnimationFrame(fade)
        } else {
            callback()
        }
    }
    fade()
}

/**
 *
 * @type {AnimationOptions}
 */
const defaultFadeOutOptions = {
    division: 60, callback: () => null
}

/**
 * Progressively fade out an element in n frame.
 * @param {!Element} elem
 * @param {?AnimationOptions} [options]
 */
export const fadeOut = (elem, options=defaultFadeOutOptions) => {
    const { division, callback } = {...defaultFadeOutOptions, ...options}
    elem.style.opacity = 1
    const increment = 1 / division
    const fade = () => {
        if ((elem.style.opacity -= increment) <= 0) {
            elem.style.display = 'none'
            callback()
        } else {
            requestAnimationFrame(fade)
        }
    }
    fade()
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
    callback: () => null, height: 100, width: 100, division: 100
}

/**
 * Move an element for height and width value.
 * @param {!Element} elem
 * @param {?MoveOutOptions} [options={height: 100, width: 100, division: 100}]
 */
export const moveOut = (elem, options=defaultMoveOptions) => {
    const { callback, height, width, division } = {...defaultMoveOptions, ...options}
    const moveHeight = height / division
    const moveWidth = width / division
    const offsets = getOffset(elem)
    const destinationX = offsets.left + width
    const destinationY = offsets.top + height
    elem.style.position = 'absolute'
    const move = () => {
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
            callback()
    }
    move()
}


/**
 *
 * @type {AnimationOptions}
 */
const defaultDeflateOptions = {
    callback: () => null, division: 100
}

/**
 * Deflate an element, making it disappear in n frames.
 * @param {!Element} elem
 * @param {?AnimationOptions} [options]
 */
export const deflate = (elem, options=defaultDeflateOptions) => {
    const { division, callback } = {...defaultDeflateOptions, ...options}
    const decrementX = Math.ceil(elem.offsetWidth / division)
    const decrementY = Math.ceil(elem.offsetHeight / division)
    const decrementFont = Math.ceil(getFontSize(elem) / division)
    elem.style.height = elem.offsetHeight + 'px'
    const defl = () => {
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
            callback()
        }
    }
    defl()
}