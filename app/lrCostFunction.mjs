import { sigmoid } from "./sigmoid.mjs";

const lrCostFunction = function (matrixTheta, matrixX, aY, nLambda) {
    const oCost = {
        J: 0,
        grad: 0
    };
    const m = aY.size()[0];
    const aSigmoids = sigmoid(math.multiply(matrixX, matrixTheta));
    return oCost;
};

export { lrCostFunction };