/**
 * Created by T4rk on 7/14/2017.
 */
import { PromiseStore } from '../src/persistance/mem-stores'
import { EventBus, valueChanged } from '../src/event-bus/event-bus'

const eventBus = new EventBus()

describe('Test PromiseStore', () => {
    let store
    let prom

    beforeEach(() => {
        spyOn(eventBus, 'dispatch').and.callThrough()
        spyOn(eventBus, 'addEventHandler').and.callThrough()

        store = new PromiseStore({
            fake: ({pay, fakeReject, delay })=> new Promise((resolve, reject) => {
                setTimeout(() => fakeReject ? reject('rejected') : resolve(pay) , delay)
        }) }, eventBus)
    })

    it('Test the store add event handlers to eventBus', () => {
        expect(eventBus.addEventHandler).toHaveBeenCalledTimes(3)
    })


    it('Test the store promise actions handlers',(done) => {
        const suber = (e) => expect('to not be called').toBeNull()

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

        store.actions.fake({fakeReject: true, delay: 1000})
        store.actions.fake({pay: 'hello', delay: 500})
    })
})
