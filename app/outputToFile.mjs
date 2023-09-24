const outputToFile = function (sContent, sLabel) {
    const sContentToOutput = JSON.stringify(sContent);
    const a = document.createElement('a');
    const sFilePrefix = sLabel ? sLabel : 'file0';
    a.href = `data:text/plain,${sContentToOutput}`;
    a.download = `a0-${sFilePrefix}.debug.littlemachine`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

export { outputToFile };