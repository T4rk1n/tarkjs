/**
 * Created by T4rk on 7/16/2017.
 */
import { fetchRequest, xhrRequest } from '../src/requests/requests'

describe('Test requests wrappers', () => {
    it('Test fetchRequest', (done) => {
        fetchRequest('base/test/hello.txt').then(data => {
            expect(data).toBe('hello')
            done()
        })
    })
    it('Test the xhrRequest text result', (done) => {
        xhrRequest('base/test/hello.txt').then((data) => {
            expect(data).toBe('hello')
            done()
        })
    })
    it('Test the xhrRequest json result', (done) => {
        xhrRequest('base/test/test.json').then((value) => {
            expect(value.Hello).toBe('test')
            done()
        })
    })
    it('Test the xhrRequest failure', (done) => {
        xhrRequest('noneexist.json').catch(err => {
            expect(err.error).toBe('xhr_fail')
            done()
        })
    })
})

