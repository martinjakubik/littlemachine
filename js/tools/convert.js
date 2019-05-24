const args = require('./args.js');

var oFs = require('fs');
var oPath = require('path');
var sBaseDirectory = '.';

const sArg_filename = 'inputfile';
var sFilename = null;

// gets args
var aArguments = args.getArgs();
var aArgumentKeys = Object.keys(args.getArgs());
aArgumentKeys.forEach(sArgKey => {
    if (aArguments.hasOwnProperty(sArgKey)) {
        var oArg = aArguments[sArgKey];

        if (sArgKey === sArg_filename) {
            sFilename = oArg;
        }
    };
});

// if no filename given, end
if (!sFilename) {
    return;
}

// reads file
const oOptions = 'utf-8';
oFs.readFile(sFilename, oOptions, (oError, sData) => {

    if (oError) {
        throw oError;
    }

    var oData = null;
    try {
        oData = JSON.parse(sData);
    } catch (error) {
        console.error(`syntax error while trying to pars JSON data from file ${sFilename}`)
    }
    if (oData) {
        oData.forEach(oDatum => {
            console.log(`${oDatum.binary},${oDatum.label}`);
        });
    }

});