import * as oFs from 'fs/promises';

const sLibPath = './app';

const oMkDirOptions = {
    recursive: true
};

oFs.mkdir(sLibPath, oMkDirOptions).then((oResult) => {
    console.log(oResult);

    oFs.copyFile(
        './node_modules/learnhypertext/js/index.mjs', `${sLibPath}/learnhypertext.mjs`
    ).then((oResult) => {
        console.log(oResult);
    }).catch((oError) => {
        console.log(oError);
    });

}).catch((oError) => {
    console.log(oError);
});

