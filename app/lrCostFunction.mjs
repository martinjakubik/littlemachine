import { outputToFile } from "./outputToFile.mjs";
import { sigmoid } from "./sigmoid.mjs";

const lrCostFunction = function (oDebugParams, arrayTheta, matrixX, arrayY, nLambda) {

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
        grad: 0
    };

    const m = arrayY.size()[0];
    const arraySigmoids = sigmoid(math.multiply(matrixX, arrayTheta));

    const fnOneMinus = function (x) {
        return 1 - x;
    };

    // ports the following line from octave code
    //      sumall = (-y' * log(sigmoids) - (1 - y)' * log(1 - sigmoids));
    const arrayYTranspose = math.multiply(math.transpose(arrayY), -1);
    const arrayLogSigmoids = math.map(arraySigmoids, Math.log);
    const arrayOneMinusYTranspose = math.transpose(math.map(arrayY, fnOneMinus));
    const arrayLogOneMinusSigmoids = math.map(math.map(arraySigmoids, fnOneMinus), Math.log);
    const nProductYTransposeByLogSigmoids = math.multiply(arrayYTranspose, arrayLogSigmoids);
    const nProductOneMinusYTransposeByLogOneMinusSigmoids = math.multiply(arrayOneMinusYTranspose, arrayLogOneMinusSigmoids);
    const nSumall = nProductYTransposeByLogSigmoids - nProductOneMinusYTransposeByLogOneMinusSigmoids;

    // ports the following line from octave code
    //      sumsquares = sum(theta(2:end) .^ 2);
    const arrayThetaDotSquared = math.dotPow(arrayTheta, 2);
    const nSumSquares = math.sum(arrayThetaDotSquared);

    if (oDebugParams.debugActive && oDebugParams.iteration_i === 0 && oDebugParams.iteration_j === 0) {
        outputToFile(arrayY, 'arrayY');
        outputToFile(arraySigmoids, 'arraySigmoids');
        outputToFile(arrayYTranspose, 'arrayYTranspose');
        outputToFile(arrayLogSigmoids, 'arrayLogSigmoids');
        outputToFile(arrayOneMinusYTranspose, 'arrayOneMinusYTranspose');
        outputToFile(arrayLogOneMinusSigmoids, 'arrayLogOneMinusSigmoids');
        outputToFile(nProductYTransposeByLogSigmoids, 'nProductYTransposeByLogSigmoids');
        outputToFile(nProductOneMinusYTransposeByLogOneMinusSigmoids, 'nProductOneMinusYTransposeByLogOneMinusSigmoids');
        outputToFile(nSumall, 'nSumall');
    }

    // ports the following line from octave code
    //      regularized = lambda * sumsquares / (2 * m);
    const nRegularized = nLambda * nSumSquares / (2 * m);

    //      J = sumall / m + regularized;
    oCost.J = nSumall / m + nRegularized;

    //      grad = (X' * (sigmoids .- y)) / m;
    const matrixXTranspose = math.transpose(matrixX);
    const arraySigmoidsMinusY = math.subtract(arraySigmoids, arrayY);
    const arrayXMultipliedBySigmoidsMinusY = math.multiply(matrixXTranspose, arraySigmoidsMinusY);
    oCost.grad = math.divide(arrayXMultipliedBySigmoidsMinusY, 2);

    // ports the following line from octave code
    //      temp = theta;
    let arrayTemporaryTheta = math.clone(arrayTheta);

    // remaining to port:
    //      temp(1) = 0;
    //      grad = grad .+ lambda * temp / m;
    //      grad = grad(:);

    return oCost;
};

export { lrCostFunction };