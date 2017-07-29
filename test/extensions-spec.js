/**
 * Created by T4rk on 7/13/2017.
 */
import { objItems, objFormat, objCopy, objRemoveKeys, objFilter } from '../src/extensions/obj-extensions'
import { arrChunk, arrSum, arrRange, arrIncludes, arrReverse, arrIntersect } from '../src/extensions/arr-extensions'
import { SeededRandom } from '../src/extensions/random-extensions'
import {toCancelable, delayed, promiseWrap} from '../src/extensions/prom-extensions'
import { findAllMatches } from '../src/extensions/str-extensions'


describe('Test obj-extensions', () => {
    const items = {
        '1': 'one', two: 2
    }
    it('Test objItems and objFormat', () => {
        objItems(items).forEach(
            ([k, v]) => expect(objFormat({k, v}, '{k} = {v}')).toBe(k + ' = '+ v)
        )
    })
    it('Test objCopy and objRemoveKeys', () => {
        const newOne = objCopy(items)
        expect(items !== newOne).toBeTruthy()
        const another = objRemoveKeys(newOne, ['two'])
        expect(another.two).toBeUndefined()
        const lastOne = objFilter(newOne, ([k,v]) => v === 'one')
        expect(lastOne.two).toBeUndefined()
        expect(lastOne['1']).toBe('one')
    })
})

describe('test arr-extensions', () => {
    const arr = [0,1,2,3,4,5,6,7,8,9]
    it('sum of arr is 45', () => expect(arrSum(arr)).toBe(45))
    it('test arrChunk', () => {
        const chunked = arrChunk(arr, 5)
        expect(chunked).toContain([ 0, 1, 2, 3, 4 ])
        expect(chunked).toContain([ 5, 6, 7, 8, 9 ])

    })

    it('Test arrRange', () => {
        const range = arrRange(0, 10)
        expect(arr.reduce((a, e) => a && arrIncludes(range, e),true)).toBeTruthy()
    })

    it('Test arrReverse', () => {
        const reversed = arrReverse(arr)
        let j = 0
        for (let i=arr.length-1; i >= 0; i--) {
            expect(reversed[j]).toBe(arr[i])
            j++
        }
    })

    it('Test arrIntersect', () => {
        const target = [3,4,5,10]
        const intersection = arrIntersect(arr, target)
        expect(intersection).toContain(3)
        expect(intersection).toContain(4)
        expect(intersection).toContain(5)
        expect(intersection).not.toContain(10)
    })

})

// test random seed
describe('test SeededRandom', () => {
    const seed = Math.random()
    const choices = [1, 3, 4, 5, 6]
    const r1 = new SeededRandom(seed)
    const r2 = new SeededRandom(seed)
    it('Two different SeededRandom object should give the same number sequence given the same seed', () => {
        for (let i=0; i< 10; i++) {
            expect(r1.random() === r2.random()).toBeTruthy()
            expect(r1.choice(choices) === r2.choice(choices)).toBeTruthy()

        }
        r1.reset()
        expect(r1.seed === r2._seed).toBeTruthy()
        expect(r1.random() === r2.random()).toBeFalsy()
    })

    it('randRange should give a number between the given range', () => {
        for (let i=10; i< 100; i++) {
            const r = r1.randRange(0, i)
            expect(r <= i && r >= 0).toBeTruthy()
        }
    })
})

describe('Test prom-extensions', () => {
    it('Should be canceled', (done) => {
        const p = toCancelable(new Promise((resolve) => {
            setTimeout(() => resolve('hello'), 200)
        }))
        p.promise.catch(() => done())
        p.promise.then(() => expect('to be canceled').toBeNull())
        p.cancel()
    })
    it('Should be timeout', (done) => {
        const p = toCancelable(new Promise((resolve) => {
            setTimeout(()=> resolve('hello'), 300)
        }), 200)
        p.promise.then(() => expect('to be canceled').toBeNull())
        p.promise.catch(() => done())
    })

    it('Test delayed', (done) => {
        const dt = new Date() / 1000
        const p = delayed(100, () => {
            expect(dt).toBeCloseTo((new Date() - 100) / 1000)
        })
        const p2 = delayed(300, () => {
            expect('to be canceled').toBeNull()
        })
        p2.cancel()
        p2.promise.catch(done)
    })

    it('Test promiseWrap cancel', (done) => {
        const wrap = promiseWrap((e, a) => expect('canceled').toBeNull(), {args: [1,2]})
        wrap.promise.catch(done)
        wrap.cancel()
    })
})

describe('Test str-extensions', () => {
    it('Should find every number', () => {
        const m = findAllMatches('find1 n23 a22 3431 nonumber 32', new RegExp('([0-9])', 'g'), {raw: true})
        expect(m.length).toBe(11)
    })

})
