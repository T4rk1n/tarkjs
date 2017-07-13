/**
 * Created by T4rk on 7/13/2017.
 */

/**
 * Distance between two points on a cartesian plane.
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @return {number}
 */
export const distance2d = (x0, y0, x1, y1) => Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2))

/**
 * lerp 2d
 * @param {number} a
 * @param {number} b
 * @param {number} x
 * @return {number}
 */
export const linearInterpolation = (a, b, x) => a*(1-x)+b*x

/**
 * Cosinus interpolate in 2d
 * @param {number} a
 * @param {number} b
 * @param {number} x
 * @return {number}
 */
export const cosinusInterpolation = (a, b, x) => {
    const ft = x * Math.PI
    const f = (1 - Math.cos(ft)) * 0.5
    return (a * (1 - f)) + (b * f)
}

/**
 * Repeat for each colour channel.
 * @param {number} x position x to calculate the value of.
 * @param {number} y position y to calculate the value of.
 * @param {number} x1 nearest column left
 * @param {number} y1 nearest line top
 * @param {number} x2 nearest column right
 * @param {number} y2 nearest line bottom
 * @param {Array<Array>} data 2d array
 * @return {number} the approximated value of point x,y
 */
export const bilinearInterpolation = (x, y, x1, y1, x2, y2, data) => {
    const q11 = data[y1][x1], q12 = data[y2][x1], q21 = data[y1][x2], q22 = data[y2][x2]
    const ax0 = ((x2 - x)/(x2 - x1)), ax1 = ((x - x1)/(x2 - x1))
    const r1 = ax0*q11 + ax1*q21
    const r2 = ax0*q12 + ax1*q22

    return ((y2 - y) / (y2 - y1)) * r1 + ((y - y1) / (y2 - y1))*r2
}

