import { arrIncludes } from './arr-extensions'

/**
 *
 */
export const objMapReducer = (m, [k, v]) => {m[k] = v; return m}

/**
 * Works like python .items() return an array of the form [key, value]
 * @param {!Object} obj
 * @return {Array}
 */
export const objItems = (obj) => Object.keys(obj).filter(k => obj.hasOwnProperty(k)).map(k => [k, obj[k]])

/**
 * Apply a filter and return back a new object.
 * @param {!Object} obj
 * @param {!function} filterFunc
 */
export const objFilter = (obj, filterFunc) => objItems(obj).filter(filterFunc).reduce(objMapReducer, {})

/**
 * Removes the keys in an object and return a new object.
 * @param {!Object} obj
 * @param {Array} keys
 */
export const objRemoveKeys = (obj, keys) => Object.keys(obj).filter(k => obj.hasOwnProperty(k) && !arrIncludes(keys, k))
    .map(k => [k, obj[k]]).reduce(objMapReducer, {})

/**
 * Replace an object items into a string containing {key}.
 * @param {!Object} obj
 * @param {string} str
 * @return {string}
 */
export const objFormat = (obj, str) => Object.keys(obj).filter(k => obj.hasOwnProperty(k))
    .reduce((p, n) => p.replace(`{${n}}`, obj[n]), str)


