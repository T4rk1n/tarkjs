/**
 * Created by T4rk on 7/25/2017.
 */

import * as manip from '../src/dom/dom-manipulations'
import * as anim from '../src/dom/animations/animations'


describe('dom spec', () => {
    const mainElem = manip.createElement(document.querySelector('body'), 'main')
    let elem

    beforeEach(() => {
        elem = manip.createElement(mainElem, 'tempo')
    })

    afterEach(() => {
        manip.removeElement(elem)
    })

    it('Test fadeOut/In animation', (done) => {
        anim.fadeOut(elem).promise.then(() => {
            expect(elem.style.opacity).toBeLessThanOrEqual(0)
            anim.fadeIn(elem).promise.then(() => {
                expect(elem.style.opacity).toBeGreaterThanOrEqual(1)
                done()
            })
        })
    })

    it('Test moveOut animation', (done) => {
        const offsets = manip.getOffset(elem)
        elem.style = manip.serializeStyleObj({width: '100px', height: '100px',})
        anim.moveOut(elem).promise.then(() => {
            const { left, top } = manip.getOffset(elem)
            expect(offsets.left).toBe(left - 100)
            expect(offsets.top).toBe(top - 100)
            done()
        })
    })

    it('Test deflate animation', (done) => {
        elem.style = manip.serializeStyleObj({width: '100px', height: '100px', fontSize: '20px'})
        elem.innerHTML = 'Hello jasmine'
        anim.deflate(elem).promise.then(() => {
            expect(elem.offsetWidth).toBeLessThanOrEqual(0)
            expect(elem.offsetHeight).toBeLessThanOrEqual(0)
            expect(manip.getFontSize(elem)).toBeLessThanOrEqual(0)
            done()
        })
    })
})

