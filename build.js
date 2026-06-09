import * as oFs from 'fs/promises';

const sApplicationSourcePath = './src';
const sApplicationDistributionPath = './app';
const sLibPath = './app';
const sResourcePath = `${sLibPath}/resources`;

const oMkDirOptions = {
    recursive: true,
};

// copies all sources to application distribution path
const oSrcToDistCopyOptions = {
    recursive: true,
};

oFs.mkdir(sApplicationDistributionPath, oMkDirOptions)
    .then((oResult) => {
        console.log(`[success] mkdir ${sApplicationDistributionPath}`);

        // copies src to app directory
        oFs.cp(
            sApplicationSourcePath,
            sApplicationDistributionPath,
            oSrcToDistCopyOptions,
        )
            .then((oResult) => {
                console.log(`[success] copied dir ${sApplicationSourcePath}`);
            })
            .catch((oError) => {
                console.log(`  [error] details: ${oError}`);
            });
    })
    .catch((oError) => {
        console.log(`  [error] details: ${oError}`);
    });

oFs.mkdir(sLibPath, oMkDirOptions)
    .then((oResult) => {
        console.log(`[success] mkdir ${sLibPath}`);

        oFs.copyFile(
            './node_modules/learnhypertext/js/index.mjs',
            `${sLibPath}/learnhypertext.mjs`,
        )
            .then((oResult) => {
                console.log(
                    `[success] copied file ${sLibPath}/learnhypertext.mjs`,
                );
            })
            .catch((oError) => {
                console.log(`  [error] details: ${oError}`);
            });

        oFs.copyFile(
            './node_modules/localdatamanager/lib/index.mjs',
            `${sLibPath}/datacontroller.mjs`,
        )
            .then((oResult) => {
                console.log(
                    `[success] copied file ${sLibPath}/index.mjs`,
                );
            })
            .catch((oError) => {
                console.log(`  [error] details: ${oError}`);
            });

        // copies MathJS lib as browser (one file)
        oFs.copyFile(
            './node_modules/mathjs/lib/browser/math.js',
            `${sLibPath}/math.js`,
        )
            .then((oResult) => {
                console.log(`[success] copied file ${sLibPath}/math.js`);
            })
            .catch((oError) => {
                console.log(`  [error] details: ${oError}`);
            });

        oFs.copyFile(
            './node_modules/mathjs/lib/browser/math.js.map',
            `${sLibPath}/math.js.map`,
        )
            .then((oResult) => {
                console.log(`[success] copied file ${sLibPath}/math.js.map`);
            })
            .catch((oError) => {
                console.log(`  [error] details: ${oError}`);
            });
    })
    .catch((oError) => {
        console.log(`  [error] details: ${oError}`);
    });

oFs.mkdir(sResourcePath, oMkDirOptions)
    .then(() => {
        console.log(`[success] mkdir ${sResourcePath}`);

        oFs.copyFile(
            './resources/samplelist.json',
            `${sResourcePath}/samplelist.json`,
        )
            .then((oResult) => {
                console.log(
                    `[success] copied file ${sResourcePath}/samplelist.json`,
                );
            })
            .catch((oError) => {
                console.log(`  [error] details: ${oError}`);
            });
    })
    .catch((oError) => {
        console.log(`  [error] details: ${oError}`);
    });
