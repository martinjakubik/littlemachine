import * as oFs from 'fs/promises';

const sApplicationSourcePath = './src';
const sApplicationDistributiuonPath = './app';
const sLibPath = './app';
const sResourcePath = `${sLibPath}/resources`;

const oMkDirOptions = {
    recursive: true,
};

// copies all sources to application distribution path
const oSrcToDistCopyOptions = {
    recursive: true,
};

oFs.mkdir(sApplicationDistributiuonPath, oMkDirOptions)
    .then((oResult) => {
        console.log(
            `[success] mkdir ${sApplicationDistributiuonPath}; details: '${oResult}'`,
        );

        oFs.cp(
            sApplicationSourcePath,
            sApplicationDistributiuonPath,
            oSrcToDistCopyOptions,
        )
            .then((oResult) => {
                console.log(
                    `[success] copy dir ${sApplicationSourcePath}; details: '${oResult}'`,
                );
            })
            .catch((oError) => {
                console.log(`[error] details: ${oError}`);
            });
    })
    .catch((oError) => {
        console.log(`[error] details: ${oError}`);
    });

oFs.mkdir(sLibPath, oMkDirOptions)
    .then((oResult) => {
        console.log(`[success] mkdir ${sLibPath}; details: '${oResult}'`);

        oFs.copyFile(
            './node_modules/learnhypertext/js/index.mjs',
            `${sLibPath}/learnhypertext.mjs`,
        )
            .then((oResult) => {
                console.log(
                    `[success] copy file ${sLibPath}/learnhypertext.mjs; details: '${oResult}'`,
                );
            })
            .catch((oError) => {
                console.log(`[error] details: ${oError}`);
            });

        // copies MathJS lib as browser (one file)
        oFs.copyFile(
            './node_modules/mathjs/lib/browser/math.js',
            `${sLibPath}/math.js`,
        )
            .then((oResult) => {
                console.log(
                    `[success] copy file ${sLibPath}/math.js; details: '${oResult}'`,
                );
            })
            .catch((oError) => {
                console.log(`[error] details: ${oError}`);
            });

        oFs.copyFile(
            './node_modules/mathjs/lib/browser/math.js.map',
            `${sLibPath}/math.js.map`,
        )
            .then((oResult) => {
                console.log(
                    `[success] copy file ${sLibPath}/math.js.map; details: '${oResult}'`,
                );
            })
            .catch((oError) => {
                console.log(`[error] details: ${oError}`);
            });

        // copies Impress JS
        oFs.copyFile(
            './node_modules/impress.js/js/impress.min.js',
            `${sLibPath}/impress.min.js`,
        )
            .then((oResult) => {
                console.log(
                    `[success] copied file ${sLibPath}/impress.min.js; details: '${oResult}'`,
                );
            })
            .catch((oError) => {
                console.log(`[error] details: ${oError}`);
            });

        oFs.copyFile(
            './node_modules/impress.js/js/impress.min.js.map',
            `${sLibPath}/math.js.map`,
        )
            .then((oResult) => {
                console.log(
                    `[success] copoied file ${sLibPath}/impress.min.js.map; details: '${oResult}'`,
                );
            })
            .catch((oError) => {
                console.log(`[error] details: ${oError}`);
            });

        // copies MathJS lib as ESM
        const sLibPath_MathJs = `${sLibPath}/mathjs`;
        const oLibMathJsCopyOptions = {
            recursive: true,
        };
        oFs.mkdir(sLibPath_MathJs, oMkDirOptions)
            .then((oResult) => {
                console.log(
                    `[success] mkdir ${sLibPath_MathJs}; details: '${oResult}'`,
                );

                oFs.cp(
                    './node_modules/mathjs/lib/esm/',
                    sLibPath_MathJs,
                    oLibMathJsCopyOptions,
                )
                    .then((oResult) => {
                        console.log(
                            `[success] copy dir ${sLibPath_MathJs}; details: '${oResult}'`,
                        );
                    })
                    .catch((oError) => {
                        console.log(`[error] details: ${oError}`);
                    });
            })
            .catch((oError) => {
                console.log(`[error] details: ${oError}`);
            });
    })
    .catch((oError) => {
        console.log(`[error] details: ${oError}`);
    });

oFs.mkdir(sResourcePath, oMkDirOptions)
    .then((oResult) => {
        console.log(oResult);

        oFs.copyFile(
            './resources/labellist-faces-upright-16-training-3.json',
            `${sResourcePath}/labellist.json`,
        )
            .then((oResult) => {
                console.log(
                    `[success] copied file ${sResourcePath}/labellist.json; details: ${oResult}`,
                );
            })
            .catch((oError) => {
                console.log(`[error] details: ${oError}`);
            });
    })
    .catch((oError) => {
        console.log(`[error] details: ${oError}`);
    });
