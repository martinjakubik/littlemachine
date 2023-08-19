const sigmoid = function (aZ) {
    let aG = math.zeros(aZ.size()[0]);
    aG = math.dotDivide(1, aZ.map(nValue =>
        1 + math.exp(-1 * nValue)
    ));
    return aG;
};

export { sigmoid };