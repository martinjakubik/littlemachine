import { oneVsAll } from "./oneVsAll.mjs";

const classify = function (matrixData) {
    const m = matrixData.size()[0];
    const matrixX = math.subset(matrixData, math.index(math.range(0, m), math.range(0, 16)));
    const arrayY = math.squeeze(math.subset(matrixData, math.index(math.range(0, m), 16)));

    const nLabelCount = 2;
    const nLambda = 0.1;

    const arrayAllTheta = oneVsAll(matrixX, arrayY, nLabelCount, nLambda);
    return arrayAllTheta;
};

export { classify };