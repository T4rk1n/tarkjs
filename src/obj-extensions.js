/**
 * Created by T4rk on 6/19/2017.
 */
import { arrIncludes } from 'arr-extensions'

export const objMapReducer = (m, [k, v]) => {m[k] = v; return m}

/**
 * Works like python .items() return an array of the form [key, value]
 * @param obj {{}}
 * @return []
 */
export const objItems = (obj) => Object.keys(obj).map(k => [k, obj[k]])

/**
 * Apply a filter and return back a new object.
 * @param obj {{}}
 * @param filterFunc {function}
 */
export const objFilter = (obj, filterFunc) => objItems(obj).filter(filterFunc).reduce(objMapReducer, {})

/**
 * Removes the keys in an object and return a new object.
 * @param obj {{}}
 * @param keys [...string]
 */
export const objRemoveKeys = (obj, keys) => Object.keys(obj).filter(k => obj.hasOwnProperty(k) && !arrIncludes(keys, k))
    .map(k => [k, obj[k]]).reduce(objMapReducer, {})

/**
 * Replace an object items into a string containing {key}.
 * @param obj {{}}
 * @param str {string}
 * @return string
 */
export const objFormat = (obj, str) => Object.keys(obj).filter(k => obj.hasOwnProperty(k))
    .reduce((p, n) => p.replace(`{${n}}`, obj[n]), str)


