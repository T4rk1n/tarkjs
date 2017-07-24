/**
 * Created by T4rk on 7/11/2017.
 */


export const rgbToInt = (r, g, b) => ((r&0x0ff)<<16)|((g&0x0ff)<<8)|(b&0x0ff)


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
     * @param {number|string} value
     * @throws {EvalError} could not parse the string value.
     * @throws {TypeError} wrong value type provided.
     */
    set color(value) {
        switch (typeof value) {
        case 'number':
            this._color = value
            break
        case 'string':
            this._color = Color.hexStrToInt(value)
            if (!this._color) throw new EvalError(`Could not convert ${value} to int`)
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
     * Convert the int value of each rgb color to a single integer.
     * @param {int} r
     * @param {int} g
     * @param {int} b
     * @return {int}
     */
    static rgbToInt(r, g, b) {
        return ((r&0x0ff)<<16)|((g&0x0ff)<<8)|(b&0x0ff)
    }

    /**
     * Convert a hex color string to an integer.
     * @param {string} str
     * @return {*}
     */
    static hexStrToInt(str) {
        let res
        if (res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(str)) {
            const [_, r,g,b ] = res
            return  Color.rgbToInt(parseInt(r, 16), parseInt(g, 16), parseInt(b, 16))
        }
    }

    /**
     * Format to rgba string with alpha applied.
     * @param alpha
     * @return {string}
     */
    toRGBA(alpha=1) {
        return `rgba(${this.red}, ${this.green}, ${this.blue}, ${alpha})`
    }
}
