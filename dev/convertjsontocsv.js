import * as oFs from 'fs';
import { exit } from 'process';

function closeFd(fd) {
    oFs.close(fd, (oError) => {
        if (oError) throw oError;
    });
}

let nLabelledSamplesFound = 0;
let sCsvDatum = '';
let sCsvContent = '';

oFs.readFile('resources/labellist.json', { encoding: 'utf8' }, (oError, sData) => {
    if (oError) {
        console.log('error reading input JSON file');
        throw oError;
    }
    const oData = JSON.parse(sData);

    for (const oDatum of oData) {
        if (nLabelledSamplesFound >= 3000) break;
        sCsvDatum = '';
        const aBinary = oDatum.binary.split('');
        aBinary.forEach(char => {
            sCsvDatum = sCsvDatum + char + ',';
        });
        if (oDatum.label === 'yes' || oDatum.label === 'no') {
            const charY = oDatum.label === 'yes' ? '1' : '0';
            sCsvDatum = sCsvDatum + charY;
            sCsvDatum = sCsvDatum + '\n';
            sCsvContent = sCsvContent + sCsvDatum;
            nLabelledSamplesFound++;
        }
    }
    console.log(`${nLabelledSamplesFound} labelled samples read`);

    const oWritableStream = oFs.createWriteStream('resources/labellist.csv');

    oWritableStream.write(sCsvContent, (oError) => {
        if (oError) {
            console.log('error writing to CSV file');
            throw oError;
        }
    });
});
