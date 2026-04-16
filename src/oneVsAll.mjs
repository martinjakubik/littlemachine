import { fminsearch } from './fminsearch.mjs';
import { lrCostFunction } from './lrCostFunction.mjs';
import { squeeze as math_squeeze } from 'https://cdn.jsdelivr.net/npm/mathjs@14.0.1/+esm';
import { concat as math_concat } from 'https://cdn.jsdelivr.net/npm/mathjs@14.0.1/+esm';
import { map as math_map } from 'https://cdn.jsdelivr.net/npm/mathjs@14.0.1/+esm';
import { zeros as math_zeros } from 'https://cdn.jsdelivr.net/npm/mathjs@14.0.1/+esm';
import { ones as math_ones } from 'https://cdn.jsdelivr.net/npm/mathjs@14.0.1/+esm';

const oneVsAll = function (
    mathlib,
    matrixX0,
    arrayY,
    nLabelCount,
    nLambda,
    oDisplayOptions,
) {
    // X0 is expected to be a matrix of parameters; 2000 rows with 16 columns is a reasonable size
    const aMatrixSize = matrixX0.size();

    // m is the row count (ex. 2000)
    const m = aMatrixSize[0];

    // n is the column count (ex. 16)
    const n = aMatrixSize[1];

    // allTheta has 2 rows (1 per yes/no label), and 17 columns (16 parameters plus a placeholder zero for the label)
    const arrayAllTheta = math_zeros(nLabelCount, n + 1);

    // X1 concatenates a column of 1's at the left of X0
    const matrixX1 = math_concat(math_ones(m, 1), matrixX0);

    // initialTheta is a column vector matching the number of parameters in X0;
    // it therefore has one row per column in X0, plus one;
    // a reasonable size is 17 rows
    const arrayInitialTheta = math_squeeze(math_zeros(n + 1, 1));

    const oDebugParams = {
        debugActive: false,
        iteration_i: 0,
        iteration_j: 0,
    };

    // for c = 1:num_labels
    // all_theta(c, :) = ...
    //     fmincg (@(t)(lrCostFunction(t, X, (y == c), lambda)), ...
    //         initial_theta, options);
    // end;
    const c = 1;
    const label = c - 1;
    const arrayYPerLabel = math_map(arrayY, (nValue) => {
        return nValue === label ? 1 : 0;
    });

    // for gradientThreshold:
    // use 1.0e-19 as a reasonable value to stop the fminsearch
    // use 1.0e-6 to stop relatively quickly for debugging
    const oFMinSearchOptions = {
        maxIter: 1000,
        gradientThreshold: 1.0e-19,
        display: true,
        displayLevel: 1,
        displayFunction: oDisplayOptions.displayFunction,
    };
    fminsearch(
        oDebugParams,
        mathlib,
        (oCostFunctionDebugParams, mathlib, arrayTheta) =>
            lrCostFunction(
                oCostFunctionDebugParams,
                mathlib,
                arrayTheta,
                matrixX1,
                arrayYPerLabel,
                nLambda,
            ),
        arrayInitialTheta,
        matrixX0,
        arrayY,
        oFMinSearchOptions,
    );

    return arrayAllTheta;
};

export { oneVsAll };
