/**
 * Created by T4rk on 6/19/2017.
 */
import { objMapReducer } from './obj-extensions'

/**
 * Chunk an array in chunks of length n
 * @param {!Array} arr original array
 * @param {!int} n length of chunks
 * @return {Array}
 */
export const arrChunk = (arr, n) => arr.map((item, index) => index % n === 0 ? arr.slice(index, index + n) : null)
    .filter(item => item)

/**
 * Lookup if the element e is included in arr.
 * @param {!Array} arr
 * @param {!Object} e element to lookup
 * @return {boolean}
 */
export const arrIncludes = (arr, e) => arr.reduce((p, n) => (p || e === n), false)

/**
 * Apply a mapping [key, value] function to an array and return an object.
 * @param {!Array} arr - Original Array
 * @param {!function} mapping - should return a mapping [key, value]
 * @param {?Object} obj - set on an existing object by providing a value.
 * @return {Object}
 */
export const arrMapReduceToObj = (arr, mapping, obj={}) => arr.map(mapping).reduce(objMapReducer, obj)

/**
 * Copy the elements of an array to a new array.
 * @param {Array} arr
 * @param {Array} [onto=[]]
 * @return {Array}
 */
export const arrCopy = (arr, onto=[]) => arr.reduce((a,e) => {a.push(e); return a} ,onto)

/**
 * Merges arrays together
 * @param {Array} arr initial array.
 * @param {...Array} arrs arrays to merge into arr
 * @example
 * import { arrMerge } from 'tarkjs'
 * const merged = arrMerge([], [1,2], [3,4], [5,6])
 * // [1,2,3,4,5,6]
 */
export const arrMerge = (arr, ...arrs) => arrs.reduce((a, e) => arrCopy(arrCopy(e, a)), arr)

/**
 * Sum the numbers from an array.
 * @param {Array} arr containing numbers only.
 * @return {Number}
 */
export const arrSum = (arr) => arr.reduce((p, n) => p+n, 0)

/**
 * Generate a list of number.
 * @param {number} start Beginning of the sequence.
 * @param {number} stop End of the sequence.
 * @param {number} [step=1]
 * @return {Array}
 */
export const arrRange = (start, stop, step=1) => {
    const arr = []
    for (let i=start; step > 0 ? i < stop : i > stop; i += step) arr.push(i)
    return arr
}

/**
 * Return the elements of arr that are also in other.
 * @param {Array} arr source array
 * @param {Array} target
 * @return {Array}
 */
export const arrIntersect = (arr, target) => arr.filter(e => arrIncludes(target, e))

/**
 * Reverse the array without mutating the original.
 * @param {Array} arr Original to reverse.
 * @return {Array} new reversed array.
 */
export const arrReverse = (arr) => {
    const reversed = []
    for (let i=arr.length-1; i >= 0; i--) reversed.push(arr[i])
    return reversed
}
