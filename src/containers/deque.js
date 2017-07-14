/**
 * Created by T4rk on 6/30/2017.
 */

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
        return this._arr.shift()
    }

    /**
     * Insert item at the end of the stack.
     * @param {*} item
     * @return {Deque} this
     */
    pushBack(item) {
        this._arr.push(item)
        if (this._capacity && this._arr.length >= this._capacity) this.popFront()
        return this
    }

    /**
     * Insert an item at the first position of the stack.
     * @param {*} item
     * @return {Deque} this
     */
    pushFront(item) {
        this._arr.unshift(item)
        if (this._capacity && this._arr.length >= this._capacity) this.popBack()
        return this
    }

    /**
     * @param {function} mapping
     * @return {Array} mapped array.
     */
    map(mapping) {
        return this._arr.map(mapping)
    }

    /**
     * @param {function} predicate
     * @return {Array}
     */
    filter(predicate) {
        return this._arr.filter(predicate)
    }

    /**
     * @param {function} reducer
     * @param {function} first
     * @return {*}
     */
    reduce(reducer, first) {
        return this._arr.reduce(reducer, first)
    }

    /**
     * @param {function} each
     */
    forEach(each) {
        this._arr.forEach(each)
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
}
