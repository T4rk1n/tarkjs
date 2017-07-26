/**
 * Created by Phil on 7/12/2017.
 */

import { objItems } from '../extensions/obj-extensions'

const jsonPattern = /json/i

/**
 * Fetch promise wrap
 *
 * If you don't care about the response headers and meta, use this to stay dry.
 * Intended to be used with the PromiseStore so it have a valid resolve value when fulfilled.
 *
 * If the response is json, it will automatically parse the value to an object.
 * Cancellation: unsupported by the fetch api, rejection on return. Use xhr if there's a need to cancel.
 * @param {!string} url the address to fetch
 * @param {Object} [init={}] the fetch init object.
 * @return {CancelablePromise} Not really cancelable
 */
export const fetchRequest = (url, init={}) => {
    let canceled
    const promise = new Promise((resolve, reject) => {
        fetch(url, init).then((rep) => {
            if (canceled) reject({
                error: 'canceled',
                message: `Fetch was canceled. status: ${rep.statusCode}`,
                response: rep
            })
            else if (rep.ok) {
                if (jsonPattern.test(rep.headers['Content-Type'])) rep.json().then(value => resolve(value))
                else rep.text().then(value => resolve(value))
            }
            else {
                reject({
                    error: 'fetch_fail',
                    message: `Fetch ${url} failed, status: ${rep.statusCode}, message: ${rep.statusText}`,
                    response: rep
                })
            }
        }).catch(err => reject(err))

    })
    return {promise, cancel: () => canceled = true}
}
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
 * Cancellation: xhr.abort
 * @param {string} url
 * @param {XhrOptions} [options]
 * @return {CancelablePromise}
 */
export const xhrRequest = (url, options=defaultXhrOptions) => {
    let cancel = () => {}
    const promise = new Promise((resolve, reject) => {
        const {method, headers, payload} = {...defaultXhrOptions, ...options}
        const xhr = new XMLHttpRequest()
        xhr.open(method, url)
        objItems(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v))
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    let responseValue = xhr.response
                    if (jsonPattern.test(xhr.getResponseHeader('Content-Type'))) {
                        responseValue = JSON.parse(xhr.responseText)
                    }
                    resolve(responseValue)
                } else {
                    if (xhr.status === 0) reject({error: 'canceled', message: 'XHR was aborted.'})
                    else reject({
                        error: 'xhr_fail',
                        message: `XHR ${url} FAILED - STATUS: ${xhr.status} MESSAGE: ${xhr.statusText}`,
                        xhr
                    })
                }
            }
        }
        xhr.onerror = (err) => reject(err)
        xhr.send(payload)
        cancel = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                xhr.abort()
            }
        }
    })
    return { promise, cancel }
}
