/**
 * Created by T4rk on 7/14/2017.
 */
import { PromiseStore, SocketStore } from '../src/persistance/mem-stores'
import { EventBus, valueChanged } from '../src/event-bus/event-bus'
import {arrSum} from '../src/extensions/arr-extensions'

const eventBus = new EventBus()

describe('Test PromiseStore', () => {
    const store = new PromiseStore({
        fake: ({pay, fakeReject, delay })=> new Promise((resolve, reject) => {
            setTimeout(() => fakeReject ? reject('rejected') : resolve(pay), delay)
        })
    }, eventBus)

    beforeEach(() => {
        spyOn(eventBus, 'dispatch').and.callThrough()
        spyOn(eventBus, 'addEventHandler').and.callThrough()
    })

    it('Test the store promise actions handlers',(done) => {
        const suber = () => expect('to not be called').toBeNull()

        eventBus.addEventHandler('fake_fulfilled', (value) => {
            const { result } = store.actionStore.fake.store
            expect(result).toBe('hello')
            expect(result).toBe(value.payload)
            value.cancel()  // Test the event bus cancelable event.
        })

        store.subscribe('fake', (e) => {
            // TODO How to test the valueChange ? the events are called even if the oldValue === newValue.
            // I don't want to change the notifier setters to include the check for various reasons.
            switch (e.event) {
            case valueChanged('pending', 'fake'):
                break
            case valueChanged('fulfilled', 'fake'):
                break
            case valueChanged('rejected', 'fake'):
                break
            case 'fake_fulfilled':
                expect('to be canceled').toBeNull()  // should be canceled.
                break
            case 'fake_rejected':
                expect(e.payload).toBe('rejected')
                done()
                break
            case 'fake_pending':
                expect(e.payload).toBeUndefined()
                break
            }
        })

        store.subscribe('fake', suber)
        store.unsubscribe('fake', suber)

        store.actions.fake({fakeReject: true, delay: 400}).promise.catch(e => console.log(e))
        store.actions.fake({pay: 'hello', delay: 200}).promise.catch(console.log)
        expect(eventBus.dispatch).toHaveBeenCalledTimes(2)
    })
})

describe('Test SocketStore', () => {
    const socket = new SocketStore('ws://localhost:8889/', {
        socketName: 'test', protocols: ['echo-protocol']
    })
    it('Test the socket subscription', (done) => {
        socket.onOpen = () => socket.send('1')
        socket.onClose = () => done()

        socket.subscribe((e) => {
            const { event, payload } = e
            const { data, store  } = payload
            const num = parseInt(data)
            expect(store.length).toBe(num)
            expect(store.include(data)).toBeTruthy()
            expect(event).toBe(socket.socket_message_received)
            expect(num).toBeGreaterThanOrEqual(1)
            if (parseInt(data) > 10) socket.close()
            else socket.send(`${num + 1}`)
        })
        socket.start()
    })
})



describe('Event bus spec', () => {
    const r = /hello/
    const handler = {handle: (e) => {
        expect(r.test(e.event)).toBeTruthy()
    }}
    beforeEach(() => {
        spyOn(handler, 'handle').and.callThrough()
    })

    it('Test the dispatch of eventBus is async', (done) => {
        // This will fail under a severely outdated environment.
        let check = false
        eventBus.addEventHandler('async', () => {
            let dt = new Date()
            while ((new Date()) - dt <= 300) { /**/ }
            check = true

        })
        eventBus.dispatch({event: 'async'}).promise.then(done)
        expect(check).toBeFalsy()
    })

    it('Test the accumulation of events return values', (done) => {
        eventBus.addEventHandler('accumulate', (e) => e.payload)
        eventBus.addEventHandler('accumulate', (e) => arrSum(e.acc) + 1)
        eventBus.dispatch({event: 'accumulate', payload: 10}).promise.then(({acc}) => {
            expect(arrSum(acc)).toBe(21)
            done()
        })
    })

    it('Test eventBus regex dispatch handler', (done) => {
        eventBus.addEventHandler(r, handler.handle)
        expect(eventBus.findHandlers('hello').length).toBe(1)
        eventBus.dispatch({event: 'nope'}).promise.catch(() => {})
        eventBus.dispatch({event: 'hello_world'}).promise.then(() => {
            expect(handler.handle).toHaveBeenCalledTimes(1)
            done()
        })
    })
})
