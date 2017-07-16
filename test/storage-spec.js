/**
 * Created by T4rk on 7/16/2017.
 */
import { BrowserLocalStorage, CookieStorage } from '../src/persistance/persistance'

describe('Test persistent storage' , () => {
    const storage = new BrowserLocalStorage()
    const cookies = new CookieStorage()
    beforeEach(() => {
        storage.setStorageItem('simplestring', 'simple')
        storage.setStorageItem('jsonstring', { simple: 'string', num: 12 }, {isJson: true})
        cookies.setStorageItem('cooktest', 'have a cookie')
        cookies.setStorageItem('secondcook', 'cookiemaster')
    })
    it('Test localStorage', () => {
        expect(storage.getStorageItem('simplestring')).toBe('simple')
        const j = storage.getStorageItem('jsonstring', {isJson: true})
        expect(j.simple).toBe('string')
        expect(j.num).toBe(12)
        storage.removeStorageItem('simplestring')
        expect(storage.getStorageItem('simplestring')).toBeNull()

    })
    it('Test cookies', () => {
        const { cooktest, secondcook, noDefined } = CookieStorage.getAll()
        expect(cookies.getStorageItem('cooktest')).toBe(cooktest)
        expect(cookies.getStorageItem('cooktest')).toBe('have a cookie')
        expect(noDefined).toBeUndefined()
        expect(secondcook).toBe('cookiemaster')
    })
})

