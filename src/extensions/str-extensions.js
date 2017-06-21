/**
 * Created by T4rk on 6/19/2017.
 */

/**
 * @typedef {Object} FindAllOptions
 * @property {int} indexGet
 * @property {boolean} raw
 */

const defaultFindAllOptions = {
    indexGet: 1, raw: true
}

/**
 * Find all regex matches in a string.
 * @param {!string} str string to find matches.
 * @param {!RegExp} re
 * @param {?FindAllOptions} [options={indexGet: 1, raw: true}]
 * @return {!Array}
 */
export const findAllMatches = (str, re, options=defaultFindAllOptions) => {
    const { indexGet, raw } = {...defaultFindAllOptions, ...options}
    const matches = []
    let m
    while (m = re.exec(str)) {
        matches.push(raw ? m : m[indexGet])
    }
    return matches
}

/**
 * Capitalize the first letter of a string.
 * @param {!string} str
 * @return {!string}
 */
export const capitalize = (str) => `${str.charAt(0).toLocaleUpperCase()}${str.substr(1, str.length)}`
