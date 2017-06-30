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
 * @return {Array}
 */
export const arrCopy = (arr) => arr.reduce((a,e) => {a.push(e); return a} ,[])