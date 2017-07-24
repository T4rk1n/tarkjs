/**
 * Created by T4rk on 7/22/2017.
 */

import { objExtend } from '../extensions/obj-extensions'


const defaultMutantOptions = {
    onFulfilled: () => {}, onRejected: () => {}
}

/**
 * Create a MutationObserver instance that dispatch events on mutations.
 * @param {string} notifierName
 * @param {EventBus} eventBus
 * @param {Object} [options={onFulfilled: function, onRejected: function}]
 * @return {MutationObserver}
 */
export const mutantNotifier = (notifierName, eventBus, options=defaultMutantOptions) => {
    const { onFulfilled, onRejected } = objExtend({}, defaultMutantOptions, options)
    return new MutationObserver((mutations) => {
        eventBus.dispatch({event: `${notifierName}_mutated`, payload: mutations})
            .promise.then(onFulfilled).catch(onRejected)
    })
}

