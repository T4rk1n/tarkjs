/**
 * Created by T4rk on 7/22/2017.
 */

import { objFormat, objCopy, objExtend, objItems, objFilter } from '../extensions/obj-extensions'

/**
 * Extended object with the functions from {@link src/extensions/obj-extensions.js}.
 */
export class TObject {
    /**
     * @param {Object} [obj={}] Object to extends properties
     */
    constructor(obj={}) {
        this.extendProps(obj)
    }

    /**
     * {@link objFormat}
     * @param {string} str
     * @return {string}
     */
    formatProps(str) { return objFormat(this, str) }

    /**
     * {@link objCopy}
     * @return {Object}
     */
    copyProps() { return objCopy(this) }

    /**
     * {@link objExtend}
     * @param {Object} others
     */
    extendProps(...others) { return objExtend(this, ...others) }

    /**
     * {@link objItems}
     * @return {Array<Array<string,*>>}
     */
    items() { return objItems(this) }

    /**
     * {@link objFilter}
     * @param {function(e: *):boolean} predicate
     * @return {Array}
     */
    filterProps(predicate) { return objFilter(this, predicate) }

    /**
     * Object.values or mapping of values.
     * @return {Array<*>}
     */
    values() { return Object.values ? Object.values(this) : Object.keys(this).map(k => this[k]) }

    /**
     * Get with a default.
     * @param {*} key
     * @param {*} orElse
     * @return {*}
     */
    opt(key, orElse=undefined) {
        return this[key] || orElse
    }
}


