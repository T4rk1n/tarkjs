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


    popBack() {
        return this._arr.pop()
    }

    popFront() {
        return this._arr.shift()
    }

    /**
     * Insert item at the end of the stack.
     * @param {*} item
     */
    pushBack(item) {
        this._arr.push(item)
        if (this._capacity && this._arr.length >= this._capacity) this.popFront()
    }

    /**
     * Insert an item at the first position of the stack.
     * @param {*} item
     */
    pushFront(item) {
        this._arr.unshift(item)
        if (this._capacity && this._arr.length >= this._capacity) this.popBack()
    }

    map(mapping) {
        return this._arr.map(mapping)
    }

    filter(predicate) {
        return this._arr.filter(predicate)
    }

    reduce(reducer, first) {
        return this._arr.reduce(reducer, first)
    }

    forEach(each) {
        this._arr.forEach(each)
    }

    at(index) {
        return this._arr[index]
    }

    get length() {
        return this._arr.length
    }
}
