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
oFs.readFile(sFilename, oOptions, (oError, oData) => {

    if (oError) {
        throw oError;
    }

});

console.log('reading file \"' + sFilename + '\"');

