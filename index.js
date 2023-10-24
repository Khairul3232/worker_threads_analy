import { SubsetSum } from './subsetSumThreads.js';

const arr = JSON.parse(process.argv[2]);
const sum = JSON.parse(process.argv[3]);
const NUM_MATCHES_REQUIRED = process.argv[4] || 2;
const limit = NUM_MATCHES_REQUIRED - 1;
console.log('Data is ', arr);
console.log('Subset Sum expected: ', sum);
let matchesCount=0;

// call upon the thread to call the worker to make the calculations on subsetSum.js
const subsetSum = new SubsetSum(sum, arr);

subsetSum.on('match', match => {
    console.log(`Match: ${JSON.stringify(match)}.\n`);
    if(++matchesCount > limit){ subsetSum.emit('end'); }
});

subsetSum.on('end', () => exit(matchesCount))

// after finish preparing to listen, start it.
subsetSum.start();

function exit(numMatches) {
    console.log('SubsetSum Ended.');
    console.log(`Total matches: ${numMatches}`);
    process.exit(0);
}