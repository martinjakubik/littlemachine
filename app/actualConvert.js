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

const convertToArray = function (oJsonData, bKeepUnlabelled = false) {
    let aCsvData = [];
    return aCsvData;
}

export { convertToString, convertToArray };