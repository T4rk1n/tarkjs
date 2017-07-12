/**
 * Created by Phil on 7/12/2017.
 */

import { objItems } from "../extensions/obj-extensions"

const jsonPattern = /json/i

/**
 * @typedef {Object} FetchOptions
 * @property {boolean} rejectNotOk to reject the promise when the response is not successful (statusCode >= 400).
 */

/**
 * @type {FetchOptions}
 */
const defaultFetchOptions = {
    rejectNotOk: true
}

/**
 * Fetch promise wrap
 *
 * If you don't care about the response headers and meta, use this to stay dry.
 * Intended to be used with the PromiseStore so it have a valid resolve value when fulfilled.
 *
 * If the response is json, it will automatically parse the value to an object.
 * @param {!string} url the address to fetch
 * @param {Object} [init={}] the fetch init object.
 * @param {FetchOptions} [options={rejectNotOk: true}]
 */
export const fetchRequest = (url, init={}, options=defaultFetchOptions) => new Promise((resolve, reject) => {
    const { rejectNotOk } = {...defaultFetchOptions, ...options}
    fetch(url, init).then((rep) => {
        if (rep.ok) {
            if (jsonPattern.test(rep.headers['Content-Type'])) rep.json().then(value => resolve(value))
            else rep.text().then(value => resolve(value))
        } else {
            if (rejectNotOk) reject(`FETCH ${url} FAILED - STATUS: ${rep.statusCode} MESSAGE: ${rep.statusText}`)
        }
    }).catch(err => reject(err))
})

/**
 * @typedef {Object} XhrOptions
 * @property {string} [method='GET']
 * @property {Object} [headers={}]
 * @property {string|Blob|ArrayBuffer} [payload='']
 */

/**
 * @type {XhrOptions}
 */
const defaultXhrOptions = {
    method: 'GET',
    headers: {},
    payload: ''
}

/**
 * Xhr promise wrap.
 *
 * Fetch can't do put request, so xhr still useful.
 *
 * Auto parse json responses.
 * @param {string} url
 * @param {XhrOptions} [options]
 */
export const xhrRequest = (url, options=defaultXhrOptions) => new Promise((resolve, reject) => {
    const { method, headers, payload } = {...defaultXhrOptions, ...options}
    const xhr = new XMLHttpRequest()
    xhr.open(method, url)
    objItems(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v))
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            let responseValue = xhr.response
            if (jsonPattern.test(xhr.getResponseHeader("Content-Type"))) {
                responseValue = JSON.parse(xhr.responseText)
            }
            resolve(responseValue)
        } else {
            reject(`XHR ${url} FAILED - STATUS: ${xhr.status} MESSAGE: ${xhr.statusText}`)
        }
    }
    xhr.onerror = (err) => reject(err)
    xhr.send(payload)
})
