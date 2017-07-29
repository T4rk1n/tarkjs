/**
 * Created by T4rk on 7/11/2017.
 */


export const rgbToInt = (r, g, b) => ((r&0x0ff)<<16)|((g&0x0ff)<<8)|(b&0x0ff)

export const hexStrToInt = (str) => {
    const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(str)
    if (res) {
        const [_, r,g,b ] = res
        return  rgbToInt(parseInt(r, 16), parseInt(g, 16), parseInt(b, 16))
    }
}



/**
 *
 */
export class Color {
    /**
     * @param {number|string} color
     */
    constructor(color) {
        this.color = color
    }

    /**
     * Change the internal color.
     * @param {number|string|Object} value
     * @throws {EvalError} could not parse the string value.
     * @throws {TypeError} wrong value type provided.
     */
    set color(value) {
        switch (typeof value) {
        case 'number':
            this._color = value
            break
        case 'string':
            this._color = Color._convertFromString(value)
            break
        case 'object':
            this._color = Color._convertFromObject(value)
            break
        default:
            throw new TypeError(`Is this a color: ${value} ?`)
        }
    }

    /**
     *
     * @return {number}
     */
    get int() {
        return this._color
    }

    /**
     * @return {string}
     */
    get hexString() {
        return `#${this.int.toString(16)}`
    }

    /**
     * @return {number}
     */
    get red() { return ((this._color & 0xff0000) >> 16) }

    /**
     * @return {number}
     */
    get green() { return ((this._color & 0x00ff00) >> 8) }

    /**
     * @return {number}
     */
    get blue() { return (this._color & 0x0000ff) }

    /**
     * @return {{r: number, g: number, b: number}}
     */
    get rgb() { return { r: this.red, g: this.green, b: this.blue }}

    /**
     * Format to rgba string with alpha applied.
     * @param alpha
     * @return {string}
     */
    toRGBA(alpha=1) {
        return `rgba(${this.red}, ${this.green}, ${this.blue}, ${alpha})`
    }

    static _convertFromObject(obj) {
        const { r, g, b } = obj
        if (!([r,g,b].reduce((p,n) => p && n))) throw TypeError('Missing property r, g or b')
        return rgbToInt(r,g,b)
    }

    static _convertFromString(str) {
        const color = hexStrToInt(str)
        if (!color) throw new EvalError(`Could not convert ${color} to int`)
        return color
    }
}
