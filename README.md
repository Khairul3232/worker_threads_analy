# Subset Sum Match

This application uses worker_threads to join different sets of arrays 
and generate the sum to see if it matches the required sum. 

## Run
#### Syntax
> `node` `index.js [array_ints] [expected_sum] (num_of_matches)`

### Passing test one:
> `node index.js [116,119,101] 336`

### Failing test two:
> `node index.js [116,119,101] 0`
- because none of the subsets sum up to zero

### Passing test two:
> `node index.js [116,119,101,101,-116,109,101,-105,-102,117,-115,-97,119,-116,-104,-105,115] 0`


### Files
1. index.js
2. threadPool.js
3. subsetSumThreads.js
4. subsetSumThreadWorker.js
5. subsetSum.js


### A. index.js
1. Set up to capture the arguments; Array of integers and the expected sum.
2. Then instantiates the `SubsetSum` of `subsetSumThreads.js`. 
3. And then we listen on 'match' and 'end'
   - 'match' emitted from `subsetSumThreads.js`, when there is a match of sum and sum of subset.
   - 'end' emitted from `subsetSumThreads.js`, to indicate end of the process, that was originally emitted from `subsetSum.js` start function. 
4. With preparation listeners ready, we start the thread of `subsetSumThreads.js`

### B. threadPool.js
1. For maintaining and starting pool of threads.
2. Called by `subsetSumThreads.js`, getOne function, returns a Promise, that resolves in a worker thread, when available.
3. If the number of active threads equates to or exceeds the maximum defined, then the promise will be put in the waiting list to wait for the next available worker.
4. When it is determined that there are no worker threads available in the pool and that the number of active workers have not exceed the maximum, then a new worker (subsetSumThreadWorker.js) will be created.
5. Upon worker javascript execution, the worker will be placed in active array, and resolved. 
6. And for that new worker, upon exit will be removed from the active and from the pool. This happens when worker had to exit.
7. If the worker does not have to exit, it will be put back into the pool, as in the release function.

### C. subsetSumThreads.js
1. The start method is called from the index.js
2. it gets one worker thread from the thread pool.
3. Sends the data and sum to the worker (subsetSumThreadWorker.js), which will then create a new instance of the SubsetSum object.
4. Further on, it listens to message coming from the thread worker(subsetSumThreadWorker.js)
5. If the message is and end event, then the worker will be released, or other events will be emitted back to the index.js

### D. subsetSumThreadWorker.js
1. Listens for message coming from subsetSumThreads.js start function. 
2. The msg object has the data and the sum.
3. The object subsetSum expects and listens for the match and end, of which the message will be posted to subsetSumThreads.js

### E. subsetSum.js
1. This is the process to be run. 
2. combines, working from an empty set and incrementally adding elements to the subset and processing it recursively.
3. If there is a match of the sum, it will emit the match event to the subsetSumThreadWorker.js
4. or that once it's done, it will emit the end event. 


###### Ω A remake, re-modified and re-adapted from Cascario 2020.