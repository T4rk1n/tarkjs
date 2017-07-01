/**
 * Created by T4rk on 6/27/2017.
 */

/**
 * Simple random number generator that shoots numbers based on a seed sequence.
 * No guarantee to randomness uniformity.
 */
export class SeededRandom {
    /**
     * @param {Number} seed
     */
    constructor(seed) {
        /**
         * Seed of the sequence.
         * @type {Number}
         */
        this.seed = seed
        this._mask = 0xffffffff
    }

    get seed() { return this._seed }

    set seed(seed) {
        this._seed = seed
        this._mutx = seed << 7777361
        this._mutz = 8954273
    }

    /**
     * Generate a new number from the seeded sequence.
     * @return {number} a number between -1 and 1
     */
    random() {
        this._mutz = (36969 * (this._mutz & 65535) + (this._mutz >> 16)) & this._mask
        this._mutx = (18000 * (this._mutx & 65535) + (this._mutx >> 16)) & this._mask
        const r = ((((this._mutz << 16) + this._mutx) & this._mask) / 424967296) - 0.5
        return r - Math.floor(r)
    }

    /**
     * Reset the sequence with the same seed.
     */
    reset() {
        this.seed = this._seed
    }

    /**
     * Randomly choose an element from an array.
     * @param {Array} arr
     * @return {*}
     */
    choice(arr) {
        return arr[Math.floor(Math.abs(this.random()) * arr.length)]
    }

    /**
     * Generate an int in range min and max.
     * @param {int} min
     * @param {int} max
     * @return {number}
     */
    randRange(min, max) {
        return Math.floor(Math.abs(this.random()) * (max - min + 1) + min)
    }
}
