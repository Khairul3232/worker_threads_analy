import { Worker } from 'worker_threads';
export class ThreadPool {
    constructor(file, poolMax) {
        this.file = file;
        this.poolMax = poolMax;
        this.pool = [];
        this.active = [];
        this.waiting = [];
    }

    getOne() {
        return new Promise((resolve, reject) => {
            let worker;
            if(this.pool.length > 0) {
                // there are worker threads in the pool.
                // active them and return it for work.
                worker = this.pool.pop();
                this.active.push(worker);
                return resolve(worker);
            }

            if(this.active.length >= this.poolMax) {
                // there are maximum active worker threads in pool,
                // so put this particular promise to waiting queue(array)
                // Do not confuse this with worker thread - this is not a worker thread being pushed into waiting.
                return this.waiting.push({resolve, reject});
            }

            // because there is no worker in the pool,
            // and that we have sufficient bandwidth for another worker thread,
            // and so, we launch a new worker thread, for this particular program file.
            worker = new Worker(this.file);
            worker.once('online', () => {
                // activate when worker has started executing js code.
                this.active.push(worker);
                console.log("Activated worker: ", worker.threadId);
                resolve(worker);
            });
            worker.once('exit', code => {
                // worker exited, we no longer have access to this worker,
                // so remove from active and pool queues.
                console.log(`Worker exited with code ${code}`)
                this.active = this.active.filter(w => worker !== w)
                this.pool = this.pool.filter(w => worker !== w)
            })
        });
    }

    /**
     * release function takes a worker thread parameter,
     * and instead of disposing it,
     * places it into the pool, for next use.
     * */
    release(worker) {
        if(this.waiting.length > 0) {
            // there are waiting promises,
            // so make the worker work on them, by returning the idle worker.
            const { resolve } = this.waiting.shift();
            return resolve(worker);
        }

        // there are no promises waiting,
        // so remove the worker from active queue.
        // and place the worker into the pool queue, without destroying it.
        this.active = this.active.filter(w => worker !== w);
        this.pool.push(worker);
    }
}