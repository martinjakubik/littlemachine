const convertToString = function (oJsonData, bKeepUnlabelled = false) {
    let sCsvData = '';

    if (oJsonData) {
        oJsonData.forEach(oDatum => {
            let sBinary = oDatum.binary;
            let sBinaryCsv = '';
            for (let i = 0; i < sBinary.length; i++) {
                sBinaryCsv = sBinaryCsv + sBinary[i] + (i < sBinary.length - 1 ? ',' : '');
            }
            let sLabel = -1;
            if (oDatum.label === 'yes') {
                sLabel = 1;
            } else if (oDatum.label === 'no') {
                sLabel = 0;
            }
            let sBinaryCsvWithLabelSlot = `${sBinaryCsv},${sLabel}`;
            if (bKeepUnlabelled) {
                sCsvData += sBinaryCsvWithLabelSlot;
            } else if (sLabel != -1) {
                sCsvData += sBinaryCsvWithLabelSlot;
            }
        });
    }

    return sCsvData;
};

const convertToMatrix = function (oJsonData, bKeepUnlabelled = false) {
    let matrixData = [];
    if (oJsonData) {
        oJsonData.forEach(oRow => {
            let sSample = oRow.binary;
            let aSampleRowWithLabelSlot = [];
            for (let colIndex = 0; colIndex < sSample.length; colIndex++) {
                aSampleRowWithLabelSlot.push(sSample[colIndex] === '1' ? 1 : 0);
            }
            let nLabel = -1;
            if (oRow.label === 'yes') {
                nLabel = 1;
            } else if (oRow.label === 'no') {
                nLabel = 0;
            }
            aSampleRowWithLabelSlot.push(nLabel);
            if (bKeepUnlabelled) {
                matrixData.push(aSampleRowWithLabelSlot);
            } else if (nLabel != -1) {
                matrixData.push(aSampleRowWithLabelSlot);
            }
        });
        return math.matrix(matrixData);
    }
};

export { convertToString, convertToMatrix };