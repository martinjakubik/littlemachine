const args = require('./args.js');

let oFs = require('fs');

const sArg_filename = 'inputfile';
const sArg_samplesize = 'samplesize';
let sFilename = null;
let nSampleSize = null;

// gets args
let aArguments = args.getArgs();
let aArgumentKeys = Object.keys(args.getArgs());
aArgumentKeys.forEach(sArgKey => {
    if (aArguments.hasOwnProperty(sArgKey)) {
        let oArg = aArguments[sArgKey];

        if (sArgKey === sArg_filename) {
            sFilename = oArg;
        } else if (sArgKey === sArg_samplesize) {
            nSampleSize = oArg;
        }
    };
});

// if no filename given, end
if (!sFilename) {
    return;
}

if (!nSampleSize) {
    nSampleSize = 5000;
}

let getIndexesOfPositives = function (oIndexes, oData, nNumberOfSamples) {

    oData.forEach((oDatum, iIndex) => {
        if (oIndexes[iIndex]) {
        } else if (oDatum.label === 'yes') {
            oIndexes[iIndex] = iIndex;
        }
    });

};

let makeRandomIndexesOfNegatives = function (oIndexes, oData, nNumberOfSamples) {

    let nDataSize = Object.keys(oData).length;
    let nStartingSizeOfIndexes = Object.keys(oIndexes).length;
    for (let i = nStartingSizeOfIndexes; i < nNumberOfSamples; i++) {
        let nRandom = Math.floor(Math.random() * nDataSize);
        if (oIndexes[nRandom]) {
            // skips this index
            i--;
        } else if (oData[nRandom].label === 'no') {
            // adds the line at this index
            oIndexes[nRandom] = nRandom;
        } else {
            i--;
        }
    }

};

let printData = function (oDatum) {

    let sBinary = oDatum.binary;
    let sBinaryCsv = '';
    for(let i = 0; i < sBinary.length; i++) {
        sBinaryCsv = sBinaryCsv + sBinary[i] + (i < sBinary.length - 1 ? ',' : '');
    }
    let sLabel = oDatum.label==='yes' ? '1' : '0';
    console.log(`${sBinaryCsv},${sLabel}`);

};

// reads file
const oOptions = 'utf-8';
oFs.readFile(sFilename, oOptions, (oError, sData) => {

    if (oError) {
        throw oError;
    }

    let oData = null;
    try {
        oData = JSON.parse(sData);
    } catch (error) {
        console.error(`syntax error while trying to parse JSON data from file ${sFilename}`)
    }
    if (oData) {
        const nNumberOfSamples = nSampleSize;
        let oIndexes = {};

        // gets all positives
        getIndexesOfPositives(oIndexes, oData, nNumberOfSamples);

        // gets a random set of negatives
        makeRandomIndexesOfNegatives(oIndexes, oData, nNumberOfSamples);

        let aIndexKeys = Object.keys(oIndexes);
        aIndexKeys.forEach(sKey => {
            let nIndex = oIndexes[sKey];
            let oDatum = oData[nIndex];
            printData(oDatum);
        });
    }

});