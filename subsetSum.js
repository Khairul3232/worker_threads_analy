import { EventEmitter } from 'events';

export class SubsetSum extends EventEmitter {
    constructor(sum, set, workerId) {
        super();
        this.sum = sum;
        this.set = set;
        this.totalSubsets = 0;
        this.workerId = workerId;
    }

    _combine(set, subset=[]) {
        for(let i=0; i<set.length; i++) {
            const newSubset = subset.concat(set[i]);
            this._combine(set.slice(i + 1), newSubset);
            this._processSubset(newSubset);
        }
    }

    _processSubset(subset) {
        console.log(`worker(${this.workerId}) Subset ${++this.totalSubsets}, ${subset}`);
        // calculate and emit if there is a match with sum specified as arguments
        const respond = subset.reduce((prev, item) => (prev + item), 0);
        if(respond === this.sum) {
            this.emit('match', subset);
        }
    }

    start() {
        this._combine(this.set, []);
        this.emit('end');
    }
}