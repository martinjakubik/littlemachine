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
    const arrayYTranspose = math.transpose(arrayY);
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

    return oCost;
};

export { lrCostFunction };