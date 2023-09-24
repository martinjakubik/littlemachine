import { fminsearch } from "./fminsearch.mjs";
import { lrCostFunction } from "./lrCostFunction.mjs";

const oneVsAll = function (matrixX0, arrayY, nLabelCount, nLambda) {
    const aMatrixSize = matrixX0.size();
    const m = aMatrixSize[0];
    const n = aMatrixSize[1];

    const arrayAllTheta = math.zeros(nLabelCount, n + 1);

    const matrixX1 = math.concat(math.ones(m, 1), matrixX0);

    const arrayInitialTheta = math.squeeze(math.zeros(n + 1, 1));

    // for c = 1:num_labels
    // all_theta(c, :) = ...
    //     fmincg (@(t)(lrCostFunction(t, X, (y == c), lambda)), ...
    //         initial_theta, options);
    // end;
    fminsearch((oDebugParams, arrayTheta) => lrCostFunction(oDebugParams, arrayTheta, matrixX1, arrayY, nLambda), arrayInitialTheta, matrixX0, arrayY);

    return arrayAllTheta;
};

export { oneVsAll };