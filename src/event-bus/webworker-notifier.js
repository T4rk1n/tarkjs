/**
 * Created by T4rk on 7/22/2017.
 */

/**
 * @param {string} worker
 * @param {string} event
 * @return {string}
 */
const worker_event = (worker, event) => `worker_${worker}_${event}`


/**
 * Dispatch events from a worker onmessage and onerror handlers.
 *
 * Worker events
 * - `worker_${workerName}_message`, worker.onmessage
 * - `worker_${workerName}_error`, worker.onerror
 * - `worker_${workerName}_post`, dispatch to post the payload to the worker.
 *
 * @param {Worker} worker
 * @param {string} workerName
 * @param {EventBus} eventBus
 * @return {function} the post message handler to remove from the bus if needed.
 */
export const workerNotifier = (worker, workerName, eventBus) => {
    worker.onmessage = (e) => eventBus.dispatch({
        event: worker_event(workerName, 'message'),
        payload: e
    })
    worker.onerror = (e) => eventBus.dispatch({
        event: worker_event(workerName, 'error'),
        payload: e
    })
    const onSendEvent = ({payload}) => worker.postMessage(payload)
    eventBus.addEventHandler(worker_event(workerName, 'post'), onSendEvent)
    return onSendEvent
}

