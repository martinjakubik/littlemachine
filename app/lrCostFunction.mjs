import { sigmoid } from "./sigmoid.mjs";

const lrCostFunction = function (matrixTheta, matrixX, arrayY, nLambda) {
    const oCost = {
        J: 0,
        grad: 0
    };
    const m = arrayY.size()[0];
    const arraySigmoids = sigmoid(math.multiply(matrixX, matrixTheta));
    return oCost;
};

export { lrCostFunction };