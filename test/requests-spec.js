/**
 * Created by T4rk on 7/16/2017.
 */
import { fetchRequest, xhrRequest } from '../src/requests/requests'

describe('Test requests wrappers', () => {
    it('Test fetchRequest', (done) => {
        const { promise } = fetchRequest('base/test/hello.txt')
        promise.then(data => {
            expect(data).toBe('hello')
            done()
        })
    })

    it('Test fetch failure', (done) => {
        const { promise } = fetchRequest('noneexist.json')
        promise.catch(err => {
            expect(err.error).toBe('fetch_fail')
            done()
        })
    })

    it('Test the xhrRequest text result', (done) => {
        const { promise } = xhrRequest('base/test/hello.txt')
        promise.then((data) => {
            expect(data).toBe('hello')
            done()
        })
    })

    it('Test the xhrRequest json result', (done) => {
        const { promise } = xhrRequest('base/test/test.json')
        promise.then((value) => {
            expect(value.Hello).toBe('test')
            done()
        })
    })

    it('Test the xhrRequest failure', (done) => {
        const { promise } = xhrRequest('noneexist.json')
        promise.catch(err => {
            expect(err.error).toBe('xhr_fail')
            done()
        })
    })

    it('Test the xhrRequest cancelation', (done) => {
        const { promise, cancel } = xhrRequest('base/test/test.json')
        promise.catch(err => {
            expect(err.error).toBe('canceled')
            done()
        })
        cancel()
    })
})

