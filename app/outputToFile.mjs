const formatMathObject = function (oMathJSContent, sLabel) {
    const sCurrentDate = new Date().toLocaleString();
    const sUsername = 'martin';
    const sDataType = oMathJSContent.type;
    const numRows = oMathJSContent._size ? oMathJSContent._size[0] : 0;
    const numColumns = oMathJSContent._size.length === 2 ? oMathJSContent._size[1] : 1;
    let sContentToOutput = `# Created by Little Machine, ${sCurrentDate} <${sUsername}>\n# name: ${sLabel}\n# type: ${sDataType}\n# rows: ${numRows}\n# columns: ${numColumns}\n`;
    oMathJSContent._data.forEach((element, index, array) => {
        sContentToOutput = sContentToOutput + ' ' + element;
        if (index < array.length - 1) {
            sContentToOutput = sContentToOutput + '\n';
        }
    });
    return sContentToOutput;
};


const outputToFile = function (oContent, sLabel) {
    let sContentToOutput = '';
    if (oContent.type && oContent.type === 'DenseMatrix') {
        sContentToOutput = formatMathObject(oContent, sLabel);
    } else {
        sContentToOutput = JSON.stringify(oContent);
    }
    const a = document.createElement('a');
    const sFilePrefix = sLabel ? sLabel : 'file0';
    a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(sContentToOutput)}`;
    a.download = `a0-${sFilePrefix}.debug.littlemachine`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

export { outputToFile };