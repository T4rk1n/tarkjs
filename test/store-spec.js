/**
 * Created by T4rk on 7/14/2017.
 */
import { PromiseStore } from '../src/persistance/mem-stores'
import { EventBus, valueChanged } from '../src/event-bus/event-bus'

const eventBus = new EventBus()

describe('Test the PromiseStore', () => {
    let store
    let prom

    beforeEach(() => {
        spyOn(eventBus, 'dispatch').and.callThrough()
        spyOn(eventBus, 'addEventHandler').and.callThrough()

        store = new PromiseStore({ fake: (pay)=> new Promise((resolve, reject) => {
            setTimeout(() => { resolve(pay); }, 1000)
        }) }, eventBus)


    })

    it('Should add event handlers to eventBus', () => {
        //expect(eventBus.addEventHandler).toHaveBeenCalledTimes(3) // For the three state handlers
    })

    it('Expect dispatch to be called for value changed event', () => {
        //expect(eventBus.dispatch).toHaveBeenCalledTimes(1)
        //prom.promise.then(_ => expect(eventBus.dispatch).toHaveBeenCalledTimes(0))
    })

    it('Test the store value change on action call',(done) => {
        eventBus.addEventHandler('fake_fulfilled', (value) => {
            const { result } = store.actionStore.fake.store
            expect(result).toBe('hello')
            expect(result).toBe(value.payload)
            done()
        })
        store.subscribe('fake', (e) => {
            switch (e.event) {
                case valueChanged('pending', 'fake'):
                    break
                case valueChanged('fulfilled', 'fake'):
                    break
                case valueChanged('rejected', 'fake'):
                    break
                case 'fake_fulfilled':
                    expect(e.payload).toBe('hello')
                    break
                case 'fake_rejected':
                    break
                case 'fake_pending':
                    expect(e.payload).toBeUndefined()
                    break
            }
        })
        prom = store.actions.fake('hello')
    })
})

