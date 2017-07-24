/**
 * Created by T4rk on 6/19/2017.
 */

/**
 * @typedef {Object} FindAllOptions
 * @property {int} [indexGet=1]
 * @property {boolean} [raw=true]
 */

const defaultFindAllOptions = {
    indexGet: 1, raw: true
}

/**
 * Find all regex matches in a string.
 * @param {!string} str string to find matches.
 * @param {!RegExp} re be sure to set the g
 * @param {Object} [options={indexGet: 1, raw: true}]
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

/**
 * Format a number in style: 9,999.00
 * @param {number} num the number to format
 * @param {number} [precision=2] the number of decimal to keep
 * @param {string} [separator=',']
 */
export const formatCommaSpaced = (num, precision=2, separator=',') =>
    num.toFixed(precision).replace(/(\d)(?=(\d{3})+\.)/g, `$1${separator}`)

/**
 * Format a number with a dollar sign
 * @param {!number|string} num
 * @param {string} [sign='$']
 * @param {boolean} [after=false]
 */
export const formatDollars = (num, sign='$', after=false) => after ? `${num}${sign}` : `${sign}${num}`

