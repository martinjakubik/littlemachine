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
}

const convertToMatrix = function (oJsonData, bKeepUnlabelled = false) {
    let matrixData = [];
    if (oJsonData) {
        oJsonData.forEach((oDatum, index) => {
            let sBinary = oDatum.binary;
            let aBinaryRowWithLabelSlot = [];
            for (let i = 0; i < sBinary.length; i++) {
                aBinaryRowWithLabelSlot.push(sBinary[i] === '1' ? 1 : 0);
            }
            let nLabel = -1;
            if (oDatum.label === 'yes') {
                nLabel = 1;
            } else if (oDatum.label === 'no') {
                nLabel = 0;
            }
            aBinaryRowWithLabelSlot.push(nLabel);
            if (bKeepUnlabelled) {
                matrixData.push(aBinaryRowWithLabelSlot);
            } else if (nLabel != -1) {
                matrixData.push(aBinaryRowWithLabelSlot);
            }
        });
        return matrixData;
    }
}

export { convertToString, convertToMatrix };