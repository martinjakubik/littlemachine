const classify = function (matrixData) {
    const allTheta = [[]];
    const m = math.size(matrixData)[0];
    const X = math.subset(matrixData, math.index(math.range(0, m), math.range(0, 16)));
    const y = math.squeeze(math.subset(matrixData, math.index(math.range(0, m), 16)));
    return allTheta;
};

export { classify };