import * as oFs from 'fs/promises';

const sLibPath = './app';
const sResourcePath = `${sLibPath}/resources`;

const oMkDirOptions = {
    recursive: true,
};

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
                console.log(oError);
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
                console.log(oError);
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
                console.log(oError);
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
                        console.log(oError);
                    });
            })
            .catch((oError) => {
                console.log(oError);
            });
    })
    .catch((oError) => {
        console.log(oError);
    });

oFs.mkdir(sResourcePath, oMkDirOptions)
    .then((oResult) => {
        console.log(oResult);

        oFs.copyFile(
            './resources/labellist-faces-upright-16-training-3.json',
            `${sResourcePath}/labellist.json`,
        )
            .then((oResult) => {
                console.log(oResult);
            })
            .catch((oError) => {
                console.log(oError);
            });
    })
    .catch((oError) => {
        console.log(oError);
    });
