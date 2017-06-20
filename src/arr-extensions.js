/**
 * Created by T4rk on 6/19/2017.
 */
import { objMapReducer } from './obj-extensions'

/**
 * Chunk an array in chunks of length n
 * @param arr {[]} - original array
 * @param n {int} - length of chunks
 */
export const arrChunk = (arr, n) => arr.map((item, index) => index % n === 0 ? arr.slice(index, index + n) : null)
    .filter(item => item)

/**
 * Lookup if the element e is included in arr.
 * @param arr {[]} array
 * @param e {{}} element to lookup
 */
export const arrIncludes = (arr, e) => arr.reduce((p, n) => (p || e === n), false)

/**
 *
 * @param arr {[]}
 * @param mapping {function} - should return a mapping [key, value]
 * @param obj {{}} - set on an existing object by providing a value.
 */
export const arrMapReduceToObj = (arr, mapping, obj={}) => arr.map(mapping).reduce(objMapReducer, obj)
