import { outputToFile } from './outputToFile.mjs';
import { sigmoid } from './sigmoid.mjs';
import { multiply as math_multiply } from 'https://cdn.jsdelivr.net/npm/mathjs@14.0.1/+esm';
import { map as math_map } from 'https://cdn.jsdelivr.net/npm/mathjs@14.0.1/+esm';
import { transpose as math_transpose } from 'https://cdn.jsdelivr.net/npm/mathjs@14.0.1/+esm';
import { dotPow as math_dotPow } from 'https://cdn.jsdelivr.net/npm/mathjs@14.0.1/+esm';
import { sum as math_sum } from 'https://cdn.jsdelivr.net/npm/mathjs@14.0.1/+esm';
import { subtract as math_subtract } from 'https://cdn.jsdelivr.net/npm/mathjs@14.0.1/+esm';
import { divide as math_divide } from 'https://cdn.jsdelivr.net/npm/mathjs@14.0.1/+esm';
import { flatten as math_flatten } from 'https://cdn.jsdelivr.net/npm/mathjs@14.0.1/+esm';
import { add as math_add } from 'https://cdn.jsdelivr.net/npm/mathjs@14.0.1/+esm';
import { clone as math_clone } from 'https://cdn.jsdelivr.net/npm/mathjs@14.0.1/+esm';

const lrCostFunction = function (
    oDebugParams,
    mathlib,
    arrayTheta,
    matrixX,
    arrayY,
    nLambda,
) {
    /*
    here is how cost function was imlemented in fminsearch.mjs

        (y, yp) => {
            // iterates over the array y, each element is yi
            return y.map((yi, i) => {
                return Math.pow((yi - yp[i]), 2);
            }).reduce((a, b) => {
                // sums the squares
                return a + b;
            });
        }
    */

    const oCost = {
        J: 0,
        grad: 0,
    };

    const m = arrayY.size()[0];
    const arraySigmoids = sigmoid(math_multiply(matrixX, arrayTheta));

    const fnOneMinus = function (x) {
        return 1 - x;
    };

    // ports the following line from octave code
    //      sumall = (-y' * log(sigmoids) - (1 - y)' * log(1 - sigmoids));
    const arrayYTranspose = math_multiply(math_transpose(arrayY), -1);
    const arrayLogSigmoids = math_map(arraySigmoids, Math.log);
    const arrayOneMinusYTranspose = math_transpose(
        math_map(arrayY, fnOneMinus),
    );
    const arrayLogOneMinusSigmoids = math_map(
        math_map(arraySigmoids, fnOneMinus),
        Math.log,
    );
    const nProductYTransposeByLogSigmoids = math_multiply(
        arrayYTranspose,
        arrayLogSigmoids,
    );
    const nProductOneMinusYTransposeByLogOneMinusSigmoids = math_multiply(
        arrayOneMinusYTranspose,
        arrayLogOneMinusSigmoids,
    );
    const nSumall =
        nProductYTransposeByLogSigmoids -
        nProductOneMinusYTransposeByLogOneMinusSigmoids;

    // ports the following line from octave code
    //      sumsquares = sum(theta(2:end) .^ 2);
    const arrayThetaDotSquared = math_dotPow(arrayTheta, 2);
    const nSumSquares = math_sum(arrayThetaDotSquared);

    if (
        oDebugParams.debugActive &&
        oDebugParams.iteration_i === 0 &&
        oDebugParams.iteration_j === 0
    ) {
        outputToFile(arrayY, 'arrayY');
        outputToFile(arraySigmoids, 'arraySigmoids');
        outputToFile(arrayYTranspose, 'arrayYTranspose');
        outputToFile(arrayLogSigmoids, 'arrayLogSigmoids');
        outputToFile(arrayOneMinusYTranspose, 'arrayOneMinusYTranspose');
        outputToFile(arrayLogOneMinusSigmoids, 'arrayLogOneMinusSigmoids');
        outputToFile(
            nProductYTransposeByLogSigmoids,
            'nProductYTransposeByLogSigmoids',
        );
        outputToFile(
            nProductOneMinusYTransposeByLogOneMinusSigmoids,
            'nProductOneMinusYTransposeByLogOneMinusSigmoids',
        );
        outputToFile(nSumall, 'nSumall');
    }

    // ports the following line from octave code
    //      regularized = lambda * sumsquares / (2 * m);
    const nRegularized = (nLambda * nSumSquares) / (2 * m);

    //      J = sumall / m + regularized;
    oCost.J = nSumall / m + nRegularized;

    //      grad = (X' * (sigmoids .- y)) / m;
    const matrixXTranspose = math_transpose(matrixX);
    const arraySigmoidsMinusY = math_subtract(arraySigmoids, arrayY);
    const arrayXMultipliedBySigmoidsMinusY = math_multiply(
        matrixXTranspose,
        arraySigmoidsMinusY,
    );
    oCost.grad = math_divide(arrayXMultipliedBySigmoidsMinusY, 2);

    // ports the following line from octave code
    //      temp = theta;
    let arrayTemporaryTheta = math_clone(arrayTheta);

    // ports the following lines from octave code
    //      temp(1) = 0;
    //      grad = grad .+ lambda * temp / m;
    //      grad = grad(:);
    //      return [J, grad]
    arrayTemporaryTheta[0] = 0;
    const lambdaTimesTemp = math_multiply(nLambda, arrayTemporaryTheta);
    const lambdaTimesTempDividedbyM = math_divide(lambdaTimesTemp, m);
    oCost.grad = math_add(oCost.grad, lambdaTimesTempDividedbyM);
    oCost.grad = math_flatten(oCost.grad);

    return oCost;
};

export { lrCostFunction };
