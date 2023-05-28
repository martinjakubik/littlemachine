import { getArgs } from './args.js'

import * as oFs from 'fs';


const sArg_filename = 'inputfile';
let sFilename = null;

// gets args
let aArguments = getArgs();
let aArgumentKeys = Object.keys(getArgs());
aArgumentKeys.forEach(sArgKey => {
    if (aArguments.hasOwnProperty(sArgKey)) {
        let oArg = aArguments[sArgKey];

        if (sArgKey === sArg_filename) {
            sFilename = oArg;
        }
    };
});

// if no filename given, end
if (!sFilename) {
    console.log('no file given; exiting');
    process.exit();
}

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
        oData.forEach(oDatum => {
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
            console.log(`${sBinaryCsv},${sLabel}`);
        });
    }

});