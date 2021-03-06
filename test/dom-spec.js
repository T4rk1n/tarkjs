/**
 * Created by T4rk on 7/25/2017.
 */

import * as manip from '../src/dom/dom-manipulations'
import * as anim from '../src/dom/animations/animations'
import { EventBus } from '../src/event-bus/event-bus'
import { mutantNotifier } from '../src/event-bus/mutant-notifier'
import {setElementAttributes} from '../src/dom/dom-manipulations'
import { loadImage, loadStyle, loadScript, loadAllImages } from '../src/dom/loaders'
import { rollImages } from '../src/dom/canvas'

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

    it('Mutant notifier test', (done) => {
        const eventBus = new EventBus()
        const mutant = mutantNotifier('mutant', eventBus)
        mutant.observe(elem, {attributes: true})
        eventBus.addEventHandler(/mutant/g, (e) => {
            expect(e.payload.length).toBe(2)
            mutant.disconnect()
            done()
        }, true)
        setElementAttributes(elem, { contextmenu: 'Hello', title: 'mutant'})
    })

    it('Test animate', (done) => {
        let j = 0
        let end = 80
        const animation = ({i}, stopper) => {
            expect(i).toBe(j)
            j++
            if (stopper && i > 30) return true
        }
        anim.animate([{animation}], { single: true, repeat: end}).promise.then((value) => {
            expect(value).toBe(end)
            anim.animate([{animation, infinite: true, single: true, args: [true]}]).promise.catch(done)
        })
    })

    // Generic dom-manip tests

    it('Test createElement insert front', () => {
        manip.createElement(elem, 'first')
        manip.createElement(elem, 'second', {front: true})
        expect(elem.firstChild.id).toBe('second')
    })

    it('Test loadStyle, getFontSize',  (done) => {
        loadStyle('test-style', 'base/test/style.css').promise.then(() => {
            const elemStyle = manip.createElement(elem, 'styled', {attributes: {'class': 'test-class'}})
            expect(manip.getFontSize(elemStyle)).toBe(32)
            done()
        })
    })

    it('Test loadScript', (done) => {
        loadScript('test-script', 'https://cdnjs.cloudflare.com/ajax/libs/min.js/0.2.3/$.min.js').promise.then(() => {
            const minElem = $('#main')
            expect(minElem).toBe(mainElem)
            done()
        })
    })

    it('Test loadImage', (done) => {
        const imgProm = loadImage('base/test/test-image.jpg')
        imgProm.promise.catch(e => {
            expect(e.error).toBe('canceled')
            done()
        })
        imgProm.cancel()
    })

    it('Test rollImages', (done) => {
        const canvas = manip.createElement(elem, 'canvas', {
            elementType: 'canvas',
            attributes: {
                width: 80,
                height: 48
            }
        })

        const imageList = loadAllImages('base/test/gallery/', 'jpg', 1, 3)
        imageList.promise.then(list => {
            const r = rollImages(canvas, list, {width: 80, height: 80})
            r.promise.then(i => {
                expect(i).toBe(2)
                done()
            })
        })
    })

})

