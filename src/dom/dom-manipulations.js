/**
 * Created by T4rk on 6/19/2017.
 */
import { objMapReducer, objItems } from '../extensions/obj-extensions'

/**
 * Set the attributes of a DOM Element
 * @param {!Element} elem
 * @param {!Object} attributes
 */
export const setElementAttributes = (elem, attributes) => objItems(attributes)
    .forEach(([k, v]) => elem.setAttribute(k, v))

/**
 * shorthand func
 */
export const getHead = () => document.querySelector('head')

const defaultCreateElementOptions = {
    elementType: 'div',
    attributes: {},
    innerHtml: '',
    onload: () => null
}

/**
 * Create an element only if it doesn't already exist.
 * @param {!Element} container the parent to append the new element to.
 * @param {!string} elementId unique id of the element.
 * @param {?Object} options
 * @return {Element} The created or found element.
 */
export const createElement = (container, elementId, options=defaultCreateElementOptions) => {
    let element = document.getElementById(elementId)
    if (!element) {
        const { elementType, attributes, innerHtml, onload } = {...defaultCreateElementOptions, ...options}
        element = document.createElement(elementType)
        element.id = elementId
        if (innerHtml) element.innerHTML = innerHtml
        element.onload = onload
        setElementAttributes(element, attributes)
        container.appendChild(element)
    }
    return element
}

/**
 * Remove an element from the DOM.
 * @param {Element} elem
 */
export const removeElement = (elem) => elem.parentNode.removeChild(elem)

/**
 * Load a style into the head.
 * @param {!string} styleId unique id to only load once.
 * @param {!string} cssFile file to load.
 * @param {?function} onload may only work in chrome and ff.
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
 * @param {!string} scriptId unique id to only load once.
 * @param {!string} src file to load.
 * @param {?function} [onload]
 */
export const loadScript = (scriptId, src, onload= ()=> null) => createElement(document.querySelector('body'), scriptId,{
    elementType: 'script',
    attributes: {src},
    onload
})

/**
 * Apply disabled attribute to a link tag.
 * @param {string} styleId
 */
export const disableStyle = (styleId) => setElementAttributes(document.getElementById(styleId), {disabled: 'disabled'})

/**
 * Get the position of an element in a page.
 * @param {Element} elem
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
 * Get the actual numeric value of an element style property.
 * @param {Element} elem
 * @param {string} propName
 * @return {number}
 */
export const getComputedNumStyleAttr = (elem, propName) => parseFloat(window.getComputedStyle(elem, null).getPropertyValue(propName))

/**
 * Get the actual font-size in pixel of an element.
 * @param {Element} elem
 * @return {number}
 */
export const getFontSize = (elem) => getComputedNumStyleAttr(elem, 'font-size')

const concatStr = (prev, next) => `${prev}${next}`

/**
 * Change the key style from camelCase to dash separated
 * @param {string} key
 * @return {string}
 */
export const formatStyleKey = (key) => key.split('')
    .map(item => item.charCodeAt() > 96 ? item: `-${item.toLowerCase()}`).reduce(concatStr, '')

/**
 * Serialize a style object to apply to an element on createElement attributes style
 * @param {Object} styleObj
 * @return {string}
 */
export const serializeStyleObj = (styleObj) => Object.keys(styleObj).filter(k => styleObj.hasOwnProperty(k))
    .map(k => `${formatStyleKey(k)}: ${styleObj[k]};`).reduce(concatStr, '')

/**
 * Get all the url params of the current page.
 * @return {Object}
 */
export const getUrlParams = () => window.location.search.substring(1).split('&').map(p => p.split('=')).reduce(objMapReducer)
