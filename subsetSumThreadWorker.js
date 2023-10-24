import { parentPort } from 'worker_threads';
import { SubsetSum } from './subsetSum.js';

parentPort.on('message', msg => {
    const subsetSum = new SubsetSum(msg.sum, msg.set, msg.workerId);

    // listen for match from subsetSum.js,
    // and them post the message forward to the thread in subsetSumThreads.js
    subsetSum.on('match', data => {
        parentPort.postMessage({ event: 'match', data });
    });

    subsetSum.on('end', data => {
        parentPort.postMessage({ event: 'end', data});
    });

    // then we start the process of combining and summing
    subsetSum.start();
});