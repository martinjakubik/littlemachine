import { oneVsAll } from './oneVsAll.mjs';

const classify = function (matrixData) {
    const m = matrixData.size()[0];
    const matrixX = math.subset(
        matrixData,
        math.index(math.range(0, m), math.range(0, 16)),
    );
    const arrayY = math.squeeze(
        math.subset(matrixData, math.index(math.range(0, m), 16)),
    );

    const nLabelCount = 2;
    const nLambda = 0.1;

    const nStartTime = Date.now();
    console.log('starting classification');

    const arrayAllTheta = oneVsAll(matrixX, arrayY, nLabelCount, nLambda);

    const nEndTime = Date.now();
    console.log(`finished classification; took ${nEndTime - nStartTime}`);

    return arrayAllTheta;
};

export { classify };
