import { oneVsAll } from './oneVsAll.mjs';
import { subset as math_subset } from 'https://cdn.jsdelivr.net/npm/mathjs@14.0.1/+esm';
import { range as math_range } from 'https://cdn.jsdelivr.net/npm/mathjs@14.0.1/+esm';
import { index as math_index } from 'https://cdn.jsdelivr.net/npm/mathjs@14.0.1/+esm';
import { squeeze as math_squeeze } from 'https://cdn.jsdelivr.net/npm/mathjs@14.0.1/+esm';
import { matrix } from 'https://cdn.jsdelivr.net/npm/mathjs@14.0.1/+esm';

addEventListener('message', (message) => {
    const oMessagePayload = message.data.payload || {};
    const sCommand = message.data.command || 'none';
    switch (sCommand) {
    case 'start':
        classify(oMessagePayload.labelList, oMessagePayload.options);
        break;
    default:
        break;
    }
});

const classify = function (aLabelList, oDisplayOptions) {
    const mathlib = null;

    const matrixData = matrix(aLabelList);

    // m is the number of rows, so 2000 could be a reasonable size
    const m = matrixData.size()[0];

    // keeps just the parameters by dropping the last column (16 parameters per row here)
    const matrixX = math_subset(
        matrixData,
        math_index(math_range(0, m), math_range(0, 16)),
    );

    // keeps the labels by copying the last column
    const arrayY = math_squeeze(
        math_subset(matrixData, math_index(math_range(0, m), 16)),
    );

    const nLabelCount = 2;
    const nLambda = 0.1;

    const nStartTime = Date.now();
    console.log('starting classification');

    const arrayAllTheta = oneVsAll(
        mathlib,
        matrixX,
        arrayY,
        nLabelCount,
        nLambda,
        oDisplayOptions,
    );

    const nEndTime = Date.now();
    console.log(`finished classification; took ${nEndTime - nStartTime}`);

    return arrayAllTheta;
};

export { classify };
