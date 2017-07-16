/**
 * Created by T4rk on 6/21/2017.
 */
import { objMapReducer } from '../extensions/obj-extensions'

/**
 * Base storage class to override.
 */
export class BaseStorage {
    //noinspection JSMethodCanBeStatic
    /**
     * Get a storage item.
     * @abstract
     * @param {string} key
     * @param {Object} [options]
     */
    getStorageItem(key, options={}) {
        throw new Error('Abstract call')
    }

    /**
     * Set a storage item.
     * @abstract
     * @param {string} key
     * @param {*} value
     * @param {Object} [options]
     */
    setStorageItem(key, value, options={}) {
        throw new Error('Abstract call')
    }

    /**
     * Remove an item from storage.
     * @abstract
     * @param {string} key
     * @param {Object} [options]
     */
    removeStorageItem(key, options={}) {
        throw new Error('Abstract call')
    }
}

/**
 * Base class for window.localStorage and window.sessionStorage
 */
export class BaseBrowserStorage extends BaseStorage {
    /**
     * @throws {TypeError} if not in browser.
     */
    constructor(storage) {
        super()
        if (typeof window === 'undefined') throw new TypeError('Not in browser but using browser storage ?')
        this._storage = storage
    }

    /**
     * Get a storage item, can retrieve json with option isJson=true
     * @override
     * @param {string} key
     * @param {Object} [options={isJson: false}]
     */
    getStorageItem(key, options={isJson: false}) {
        const { isJson } = options
        let j = this._storage.getItem(key)
        if (j && isJson) {
            j = JSON.parse(j)
        }
        return j
    }

    /**
     * Set storage item with json option.
     * @override
     * @param {string} key
     * @param {*} value
     * @param {Object} [options={isJson: false}]
     */
    setStorageItem(key, value, options={isJson: false}) {
        const { isJson } = options
        this._storage.setItem(key, isJson ? JSON.stringify(value) : value)
    }

    /**
     * Remove the item from storage.
     * @param {!string} key
     * @param {Object} [options]
     */
    removeStorageItem(key, options={}) {
        this._storage.removeItem(key)
    }
}

/**
 * Storage using window.sessionStorage, clear on browser exit.
 */
export class BrowserSessionStorage extends BaseBrowserStorage {
    constructor() {
        super(window.sessionStorage)
    }
}

/**
 * Storage using window.localStorage.
 */
export class BrowserLocalStorage extends BaseBrowserStorage {
    constructor() {
        super(window.localStorage)
    }
}

/**
 * Storage using cookies.
 * @link document.cookie
 */
export class CookieStorage extends BaseStorage {
    /**
     * Get a storage item from the cookies using a regex.
     * @override
     * @param {!string} key
     * @param {?Object} options
     * @return {*}
     */
    getStorageItem(key, options={}) {
        /* Think I modified the regex, now it doesn't work and I am lazy.
        const cook = document.cookie.match(new RegExp(`(^|;)\\s*${key}\\s*=\\s*([^;]+)`, 'ig'))
        return cook ? cook.pop() : '' */
        return CookieStorage.getAll()[key]
    }

    /**
     * Set a cookie.
     * @override
     * @param {!string} key
     * @param {*} value
     * @param {Object} [options={expiration:null, cookiepath:null}]
     */
    setStorageItem(key, value, options={expiration:null, cookiepath:null}) {
        const { expiration, cookiepath } = options
        document.cookie = `${key}=${value};path=${cookiepath || ''} ;expires=${expiration || ''}} }`
    }

    /**
     * Set cookie expires to
     * @override
     * @param {!string} key
     * @param {?Object} options
     */
    removeStorageItem(key, options={}) {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`
    }

    /**
     * Produce an object out of the cookies key values.
     * @return {Object} containing cookies and their keys
     */
    static getAll() {
        return document.cookie.split(';').map(e => {
            const [k, v] = e.split('=')
            return [k.trim(), v.trim()]
        }).reduce(objMapReducer, {})
    }
}

