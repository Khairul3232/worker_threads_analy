import { EventEmitter } from 'events';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import {ThreadPool} from "./threadPool.js";

// get the root directory.
const __dirname = dirname(fileURLToPath(import.meta.url));

// identify the program worker file. not the actual program
const workerFile = join(__dirname, 'subsetSumThreadWorker.js');

// generate the workers
const workers = new ThreadPool(workerFile, 3);
export class SubsetSum extends EventEmitter {
    constructor(sum, set) {
        super();
        this.sum = sum;
        this.set = set;
    }

    async start() {
        // get the available worker
        const worker = await workers.getOne();

        // send the data to the worker, subsetSumThreadWorker.js,
        // that will in turn call the program to run in the thread.
        worker.postMessage({ sum: this.sum, set: this.set, workerId: worker.threadId });

        // this is the call back function,
        // to receive message from worker, subsetSumThreadWorker.js
        // that will then either get a match or end event message.
        // if it gets a match message it will emit that message and data, to
        // the caller, in index.js
        const onMessage = msg => {
            if(msg.event === 'end') {
                // end is the signal to finish the job.
                // it removes the listener from 'message' (few lines below)
                // and release the worker from active queue.
                worker.removeListener('message', onMessage);
                workers.release(worker);
            }
            // sending it up to the index.js caller.
            console.log(`WorkerThread (${worker.threadId}): `);
            this.emit(msg.event, msg.data);
        };

        worker.on('message', onMessage);
    }
}