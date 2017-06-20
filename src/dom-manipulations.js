/**
 * Created by T4rk on 6/19/2017.
 */

/**
 * Set the attributes of a DOM Element
 * @param elem {Element}
 * @param attributes {{}}
 */
export const setElementAttributes = (elem, attributes) => {
    Object.keys(attributes).filter(k => attributes.hasOwnProperty(k))
        .forEach(k => elem.setAttribute(k, attributes[k]))
}

export const getHead = () => document.querySelector('head')

const defaultCreateElementOptions = {
    elementType: 'div',
    attributes: {},
    innerHtml: '',
    onload: () => null
}

/**
 * Create an element only if it doesn't already exist.
 * @param container {Element} the parent to append the new element to.
 * @param elementId {string} unique id of the element.
 * @param options {{}}
 * @see defaultCreateElementOptions
 * @return {Element}
 */
export const createElement = (container, elementId, options=defaultCreateElementOptions) => {
    let element = document.getElementById(elementId)
    if (!element) {
        const { elementType, attributes, innerHtml, onload } = {...defaultCreateElementOptions, ...options}
        element = document.createElement(elementType)
        element.id = elementId
        if (innerHtml) element.innerHTML = innerHtml
        element.onload = onload
        container.appendChild(element)
        setElementAttributes(element, attributes)
    }
    return element
}

/**
 * Load a style into the head.
 * @param styleId {string} unique id to only load once.
 * @param cssFile {string} file to load.
 * @param onload {function} may only work in chrome and ff.
 */
export const loadStyle = (styleId, cssFile, onload= ()=> null) => createElement(getHead(), styleId, {
    attributes: {
        rel: 'stylesheet',
        type: 'text/css',
        href: cssFile,
        media: 'all',
    },
    elementType: 'link',
    onload
})

/**
 * Append a script to the body.
 * @param scriptId {string} unique id to only load once.
 * @param src {string} file to load.
 * @param onload {function}
 */
export const loadScript = (scriptId, src, onload= ()=> null) => createElement(document.querySelector('body'), scriptId,{
    elementType: 'script',
    attributes: {src},
    onload
})

/**
 *
 * @param styleId {string}
 */
export const disableStyle = (styleId) => setElementAttributes(document.getElementById(styleId), {disabled: 'disabled'})

/**
 *
 * @param elem {Element}
 * @return {{left: number, top: number}}
 */
export const getOffset = (elem) => {
    const off = elem.getBoundingClientRect()
    return {
        left: off.left + window.scrollX,
        top: off.top + window.scrollY
    }
}

/**
 * Get the actual font-size in pixel of an element.
 * @param elem
 * @return number
 */
export const getFontSize = (elem) => parseFloat(window.getComputedStyle(elem, null).getPropertyValue('font-size'))

const concatStr = (prev, next) => `${prev}${next}`

/**
 * Change the key style from camelCase to dash separated
 * @param key {string}
 */
export const formatStyleKey = (key) => key.split('')
    .map(item => item.charCodeAt() > 96 ? item: `-${item.toLowerCase()}`).reduce(concatStr, '')

/**
 * Serialize a style object to apply to an element on createElement attributes style
 * @param styleObj
 */
export const serializeStyleObj = (styleObj) => Object.keys(styleObj).filter(k => styleObj.hasOwnProperty(k))
    .map(k => `${formatStyleKey(k)}: ${styleObj[k]};`).reduce(concatStr, '')
