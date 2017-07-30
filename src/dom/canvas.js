/**
 * Created by T4rk on 7/30/2017.
 */
import { objExtend } from '../extensions/obj-extensions'

/**
 * {@link rollImages} options.
 * @typedef {Object} RollImagesOptions
 * @property {number} [refreshRate=24] fps
 * @property {number} [width=720]
 * @property {number} [height=480]
 * @property {number} [startX=0]
 * @property {number} [startY=0]
 * @property {boolean} [loop=false]
 */

/**
 * @type {RollImagesOptions}
 */
const rollImagesOptions = {
    refreshRate: 24, width: 720, height: 480, startX: 0, startY: 0, loop: false
}

/**
 * Draw images on a canvas.
 * @param {Element} canvas a element of type canvas
 * @param {Array<Image>} imageList
 * @param {RollImagesOptions} [options]
 * @return {CancelablePromise}
 */
export const rollImages = (canvas, imageList, options=rollImagesOptions) => {
    const { refreshRate, width, height, startX, startY, loop } = objExtend({}, rollImagesOptions, options)
    const ctx = canvas.getContext('2d')
    let canceled = false,
        cancel = () => canceled = true,
        ts, i = 0,
        delay = 1000 / refreshRate
    const endX = width + startX, endY = height + startY
    const promise = new Promise((resolve, reject) => {
        const roll = (timestamp) => {
            if (!ts || timestamp - ts >= delay) {
                ctx.drawImage(imageList[i], startX, startY, endX, endY)
                i++
                ts = timestamp
            }
            if (canceled) reject({error: 'canceled', message: `roll was canceled after ${i} images.`})
            else if (i < imageList.length) requestAnimationFrame(roll)
            else if (loop) {
                i = 0
                requestAnimationFrame(roll)
            }
            else resolve(i)
        }
        roll()
    })
    return {
        promise,
        cancel
    }
}
