/**
 * Created by T4rk on 6/30/2017.
 */

import { arrIncludes, arrCopy } from '../extensions/arr-extensions'
/**
 * Double ended queue.
 */
export class Deque {
    /**
     * @param {int} [capacity] Maximum size of the deque, leave null for unlimited.
     * @param {Array} [arr] Initial array.
     */
    constructor({capacity, arr}) {
        /**
         * Inserted items will pop items from the other side if this is set.
         * @type {int}
         */
        this._capacity = capacity
        /**
         * Raw array.
         * @type {Array}
         * @private
         */
        this._arr = arr || []
    }

    /**
     * Remove from the back
     * @return {*}
     */
    popBack() {
        return this._arr.pop()
    }

    /**
     * Remove from the front
     * @return {*}
     */
    popFront() {
        this._arr = this._arr.slice(1, this._arr.length)
    }

    /**
     * Insert an item in the deque, either at front or the end
     * @param {*} item
     * @param {boolean} [front=false] insert at the front of the deque.
     * @return {Deque}
     */
    insert(item, front=false) {
        front ? this._arr.unshift(item) : this._arr.push(item)
        if (this._capacity && this._arr.length >= this._capacity) front ? this.popFront() : this.popBack()
        return this
    }

    /**
     * Insert item at the end of the stack.
     * @param {*} item
     * @deprecated
     * @return {Deque} this
     */
    pushBack(item) {
        return this.insert(item)
    }

    /**
     * Insert an item at the first position of the stack.
     * @param {*} item
     * @deprecated
     * @return {Deque} this
     */
    pushFront(item) {
        return this.insert(item, true)
    }

    include(item) {
        return arrIncludes(this._arr, item)
    }

    /**
     * To replace the deque[index]
     * @param {int} index
     * @return {*}
     */
    at(index) {
        return this._arr[index]
    }

    /**
     * @return {Number}
     */
    get length() {
        return this._arr.length
    }

    /**
     * Return a copy of the internal data.
     * @return {Array}
     */
    get data() {
        return arrCopy(this._arr)
    }
}
