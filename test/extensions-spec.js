/**
 * Created by T4rk on 7/13/2017.
 */

import { objItems, objFormat, objCopy } from '../src/extensions/obj-extensions'
import { SeededRandom } from '../src/extensions/random-extensions'

// simple tests to check how jasmine worked
describe('test objItems', function() {
    const obj = {hello: 'hi', hi: 'hello'}
    objItems(obj).forEach(([k,v]) => {
        it('Should be the same as the obj[key]', () => expect(obj[k]).toBe(v))
    })
})

describe('test objFormat', () => {
    const toFormat = '{h} {w}'
    const o = {h: 'hello', w: 'world'}
    it('Should be `hello world`', () => expect(objFormat(o, toFormat)).toBe('hello world'))
})

describe('test objCopy', () => {
    const o = {stay: 'stay', removeMe: 'removeMe'}
    const newOne = objCopy(o)
    it('Should not be the same obj', () => expect(o !== newOne).toBe(true))
})

// test random seed
describe('test SeededRandom', () => {
    const seed = Math.random()
    const r1 = new SeededRandom(seed)
    const r2 = new SeededRandom(seed)
    it('Two different SeededRandom object should give the same number sequence given the same seed', () => {
        for (let i=0; i< 10; i++) expect(r1.random() === r2.random()).toBeTruthy()
    })
    it('randRange should give a number between the given range', () => {
        for (let i=10; i< 100; i++) {
            const r = r1.randRange(0, i)
            expect(r <= i && r >= 0).toBeTruthy()
        }
    })
})

