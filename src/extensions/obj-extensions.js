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
export const objItems = (obj) => Object.keys(obj).map(k => [k, obj[k]])

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
export const objRemoveKeys = (obj, keys) => Object.keys(obj).filter(k => !arrIncludes(keys, k))
    .map(k => [k, obj[k]]).reduce(objMapReducer, {})

/**
 * Replace an object items into a string containing {key}.
 * @param {!Object} obj
 * @param {string} str
 * @return {string}
 */
export const objFormat = (obj, str) => Object.keys(obj).reduce((p, n) => p.replace(`{${n}}`, obj[n]), str)

/**
 * Copy the properties values of an object to another object.
 * Only copy properties values, no meta and proto.
 * @param {!Object} obj to copy
 * @param {Object} [onto={}] Copy the properties values to, default new object.
 * @return {Object}
 */
export const objCopy = (obj, onto={}) => Object.keys(obj).reduce((m, k) => {m[k] = obj[k]; return m}, onto)

/**
 * Object.assign or Reduce the obj with objCopy.
 */
export const objExtend = Object.assign ? Object.assign :
    (obj, ...others) => others.reduce((a, o) => objCopy(o, a), obj)

