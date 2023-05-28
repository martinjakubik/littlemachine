exports.getArgs = function () {

    // thanks to this answer: https://stackoverflow.com/a/54098693/203797
    // by https://stackoverflow.com/users/4139335/michael-warner

    // gets command-line arguments
    const oArguments = {};
    process.argv.slice(2, process.argv.length).forEach(oArgument => {

        // long arguments
        if (oArgument.slice(0, 2) === '--') {
            const longArg = oArgument.split('=');
            const longArgFlag = longArg[0].slice(2, longArg[0].length);
            const longArgValue = longArg.length > 1 ? longArg[1] : true;
            oArguments[longArgFlag] = longArgValue;
        }

        // flags
        else if (oArgument[0] === '-') {
            const flags = oArgument.slice(1, oArgument.length).split('');
            flags.forEach(flag => {
                oArguments[flag] = true;
            });
        }

    });

    return oArguments;

};