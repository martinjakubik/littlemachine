import {
    createAnchor,
    createButton,
    createCanvas,
    createDiv,
    createNumberInput,
} from './learnhypertext.mjs';
import { convertToMatrix } from './jsonToArrayConverter.js';

const MAX_EXPONENT = 4096;
const MAX_NUMBER_OF_BOXES = 65536;
const BOX_SIZE = 4;

const MIN_DECIMAL = 0;

const PICTURE_CANVAS_WIDTH = BOX_SIZE;
const PICTURE_CANVAS_HEIGHT = BOX_SIZE;
const PICTURE_CANVAS_FILL_STYLE = 'rgba(255, 255, 255, 0)';
const PICTURE_CANVAS_PIXEL_STROKE_STYLE_ON = 'rgba(255, 255, 255, 0)';
const PICTURE_CANVAS_PIXEL_STROKE_STYLE_OFF = 'rgba(255, 255, 255, 0)';
const PICTURE_CANVAS_PIXEL_FILL_STYLE_ON = 'rgb(71, 133, 49)';
const PICTURE_CANVAS_PIXEL_FILL_STYLE_OFF = 'rgba(255, 255, 255, .9)';
const DRAW_BLOCK_SIZE = 48;

const PICTURE_CANVAS_ID = 'picturecanvas';

class LabelMaker {
    static sides () {
        return {
            left: 0,
            right: 1,
        };
    }

    static labels () {
        return {
            yes: 0,
            no: 1,
        };
    }

    static getValidLabelString (iLabel) {
        let sLabel = 'unlabelled';
        const oValidLabels = LabelMaker.labels();
        const aValidLabelKeys = Object.getOwnPropertyNames(oValidLabels);
        for (let i = 0; i < aValidLabelKeys.length; i++) {
            const sValidLabelKey = aValidLabelKeys[i];
            const iValidLabel = oValidLabels[sValidLabelKey];
            if (iLabel === iValidLabel) {
                sLabel = sValidLabelKey;
                break;
            }
        }

        return sLabel;
    }

    static getMaxDecimalForBoxSize () {
        return 2 ** (BOX_SIZE ** 2);
    }

    static getValidDecimalValue (iNewDecimalValue) {
        if (
            MIN_DECIMAL <= iNewDecimalValue &&
            iNewDecimalValue <= LabelMaker.getMaxDecimalForBoxSize()
        ) {
            return iNewDecimalValue;
        }

        if (iNewDecimalValue > LabelMaker.getMaxDecimalForBoxSize()) {
            return LabelMaker.getMaxDecimalForBoxSize();
        }

        if (iNewDecimalValue < MIN_DECIMAL) {
            return MIN_DECIMAL;
        }
    }

    static makeLabelList () {
        const aLabelList = [];
        for (let i = 0; i < LabelMaker.getMaxDecimalForBoxSize(); i++) {
            const oLabel = {
                binary: convertDecimalToBinary(i, BOX_SIZE),
                label: 'unlabelled',
            };
            aLabelList.push(oLabel);
        }
        return aLabelList;
    }

    static oOutline (x, y) {
        const nCorner = 4;
        const borderWidth = 1;

        return {
            x: x,
            y: y,
            path: [
                {
                    x1: x * DRAW_BLOCK_SIZE + borderWidth + nCorner,
                    y1: y * DRAW_BLOCK_SIZE + borderWidth,
                    x2: (x + 1) * DRAW_BLOCK_SIZE - borderWidth - nCorner,
                    y2: y * DRAW_BLOCK_SIZE + borderWidth,
                },
                {
                    x1: (x + 1) * DRAW_BLOCK_SIZE - borderWidth,
                    y1: y * DRAW_BLOCK_SIZE + borderWidth + nCorner,
                    x2: (x + 1) * DRAW_BLOCK_SIZE - borderWidth,
                    y2: (y + 1) * DRAW_BLOCK_SIZE - borderWidth - nCorner,
                },
                {
                    x1: (x + 1) * DRAW_BLOCK_SIZE - borderWidth - nCorner,
                    y1: (y + 1) * DRAW_BLOCK_SIZE - borderWidth,
                    x2: x * DRAW_BLOCK_SIZE + borderWidth + nCorner,
                    y2: (y + 1) * DRAW_BLOCK_SIZE - borderWidth,
                },
                {
                    x1: x * DRAW_BLOCK_SIZE + borderWidth,
                    y1: (y + 1) * DRAW_BLOCK_SIZE - borderWidth - nCorner,
                    x2: x * DRAW_BLOCK_SIZE + borderWidth,
                    y2: y * DRAW_BLOCK_SIZE + borderWidth + nCorner,
                },
            ],
        };
    }

    constructor () {
        this.decimal = LabelMaker.getValidDecimalValue(0);
        this.labellist = LabelMaker.makeLabelList();
        this.classifyWorker = new Worker('./classify.mjs', { type: 'module' });

        this.classifyWorker.addEventListener('message', (message) => {
            const sMessageType = message.data.type || 'NONE';
            let sMessage;
            switch (sMessageType) {
            case 'update':
                sMessage = `i: ${message.data.i}, j0: ${message.data.j0}; arrayTheta0: ${message.data.arrayTheta0._data.join(', ')}`;
                this.updateTrainingDisplay(sMessage);
                break;
            default:
                break;
            }
        });
    }

    renderMainView () {
        const oContainer = createDiv('container');
        oContainer.classList.add('container');

        this.renderPictureNavigator(oContainer);
        this.renderLabelControl(oContainer);
        this.renderLoadButton(oContainer);
        this.renderClassifyButton(oContainer);
        this.renderSaveButton(oContainer);
        this.makeTrainingDisplay(oContainer);
    }

    renderPictureNavigator (oParentDiv) {
        const oPictureNavigator = createDiv('picturenavigator', oParentDiv);
        oPictureNavigator.classList.add('picturenavigator');

        const oCanvas = this.makeCanvas(oPictureNavigator);
        this.canvasPosition = {
            top: oCanvas.offsetTop,
            left: oCanvas.offsetLeft,
        };

        this.makeNavigationButton(LabelMaker.sides().left, null, oParentDiv, {
            onclick: this.incrementPicture.bind(this, -1),
        });

        this.makeNavigationButton(LabelMaker.sides().right, null, oParentDiv, {
            onclick: this.incrementPicture.bind(this, 1),
        });

        this.navigationField = this.makeNavigationField(
            {
                onchange: this.movePicture.bind(this),
            },
            oParentDiv,
        );
        this.navigationField.setAttribute('value', this.decimal);
    }

    renderPicture () {
        const i = this.decimal;
        const sSample = convertDecimalToBinary(i, BOX_SIZE);
        this.drawAsSquare(sSample);
    }

    renderLabelControl (oParentDiv) {
        const oLabelControl = createDiv('labelcontrol', oParentDiv);
        oLabelControl.classList.add('labelcontrol');

        const oLabelDots = createDiv('labeldots', oLabelControl);
        oLabelDots.classList.add('labeldots');

        this.dotYes = this.makeLabelDot(LabelMaker.labels().yes, oLabelDots);
        this.dotNo = this.makeLabelDot(LabelMaker.labels().no, oLabelDots);

        this.renderDotColors();

        const oButtonYes = this.makeLabelButton(LabelMaker.labels().yes);
        const oButtonNo = this.makeLabelButton(LabelMaker.labels().no);

        this.makeLabelCountGroup('yes', oLabelControl);
        this.makeLabelCountGroup('no', oLabelControl);
        this.makeLabelCountGroup('unlabelled', oLabelControl);

        oLabelControl.appendChild(oButtonYes);
        oLabelControl.appendChild(oButtonNo);
    }

    renderDotColors () {
        if (this.labellist[this.decimal].label === 'yes') {
            this.dotNo.classList.remove('on');
            this.dotYes.classList.add('on');
        } else if (this.labellist[this.decimal].label === 'no') {
            this.dotYes.classList.remove('on');
            this.dotNo.classList.add('on');
        } else {
            this.dotYes.classList.remove('on');
            this.dotNo.classList.remove('on');
        }
    }

    renderLabelCounts () {
        this.labelCountYes.textContent = this.getLabelCount('yes');
        this.labelCountNo.textContent = this.getLabelCount('no');
        this.labelCountUnlabelled.textContent =
            this.getLabelCount('unlabelled');
    }

    makeCanvas (oParentDiv) {
        const nWidth = PICTURE_CANVAS_WIDTH * DRAW_BLOCK_SIZE;
        const nHeight = PICTURE_CANVAS_HEIGHT * DRAW_BLOCK_SIZE;
        const oCanvas = createCanvas(
            PICTURE_CANVAS_ID,
            '',
            0,
            oParentDiv,
            nWidth,
            nHeight,
            'relative',
        );

        oCanvas.addEventListener('click', this.drawAt.bind(this), false);

        this.context = oCanvas.getContext('2d');
        this.context.fillStyle = PICTURE_CANVAS_FILL_STYLE;
        this.context.fillRect(
            0,
            0,
            PICTURE_CANVAS_WIDTH * DRAW_BLOCK_SIZE,
            PICTURE_CANVAS_HEIGHT * DRAW_BLOCK_SIZE,
        );

        this.context.lineWidth = '2';

        return oCanvas;
    }

    makeNavigationButton (iSide, sLabelName, oParentDiv, oHandlers) {
        const sSide = iSide === LabelMaker.sides().left ? 'left' : 'right';
        const sButtonLabel = iSide === LabelMaker.sides().left ? '<' : '>';

        let oButton;
        let sButtonClass;
        let sButtonId;
        if (sLabelName) {
            sButtonClass = 'labelnamenavigationbutton';
            sButtonId = `labelnamenavigationbutton${sLabelName}${sSide}`;
            oButton = createButton(sButtonId, sButtonLabel, oParentDiv);
            oButton.onclick = oHandlers.onclickwithlabelname;
        } else {
            sButtonClass = 'navigationbutton';
            sButtonId = `navigationbutton${sSide}`;
            oButton = createButton(sButtonId, sButtonLabel, oParentDiv);
            oButton.onclick = oHandlers.onclick;
        }
        oButton.classList.add(sButtonClass);

        const sButtonSideClass = `navigationbutton${sSide}`;
        const sButtonLabelNameSideClass = `labelnamenavigationbutton${sSide}`;
        oButton.classList.add(sButtonSideClass);
        oButton.classList.add(sButtonLabelNameSideClass);

        return oButton;
    }

    makeNavigationField (oHandlers, oParentDiv) {
        const oField = createNumberInput(
            'navigationfield',
            0,
            null,
            oParentDiv,
        );

        const sFieldClass = 'navigationfield';
        oField.classList.add(sFieldClass);
        oField.onchange = oHandlers.onchange;

        return oField;
    }

    makeLabelDot (iLabel, oParentDiv) {
        const sLabel = iLabel === LabelMaker.labels().yes ? 'yes' : 'no';

        const sDotClass = 'labeldot';
        const sDotId = `labeldot${sLabel}`;
        const oDot = createDiv(sDotId, oParentDiv);
        oDot.classList.add(sDotClass);

        return oDot;
    }

    makeLabelButton (iLabel) {
        const sLabel = iLabel === LabelMaker.labels().yes ? 'yes' : 'no';
        const sButtonClass = 'labelbutton';
        const sButtonId = `labelbutton${sLabel}`;
        const oButton = createButton(sButtonId, sLabel);
        oButton.classList.add(sButtonClass);
        oButton.onclick = this.setLabel.bind(this, iLabel);

        return oButton;
    }

    makeLabelCountGroup (sLabelName, oParentDiv) {
        const labelCountGroup = createDiv(
            `labelcountgroup${sLabelName}`,
            oParentDiv,
        );
        labelCountGroup.classList.add('labelcountgroup');

        this.makeNavigationButton(
            LabelMaker.sides().left,
            sLabelName,
            labelCountGroup,
            {
                onclickwithlabelname: this.moveToClosestByLabelName.bind(
                    this,
                    LabelMaker.sides().left,
                    sLabelName,
                ),
            },
        );

        const labelCountLabel = createDiv(
            `labelcountname${sLabelName}`,
            labelCountGroup,
        );
        labelCountLabel.classList.add('labelcountname');
        labelCountLabel.textContent = sLabelName;

        const sCamelCaseLabelName = `labelCount${sLabelName.substring(0, 1).toUpperCase()}${sLabelName.substring(1)}`;
        this[sCamelCaseLabelName] = createDiv(
            `labelcount${sLabelName}`,
            labelCountGroup,
        );
        this[sCamelCaseLabelName].classList.add('labelcount');
        this[sCamelCaseLabelName].textContent = this.getLabelCount(sLabelName);

        this.makeNavigationButton(
            LabelMaker.sides().right,
            sLabelName,
            labelCountGroup,
            {
                onclickwithlabelname: this.moveToClosestByLabelName.bind(
                    this,
                    LabelMaker.sides().right,
                    sLabelName,
                ),
            },
        );

        return labelCountGroup;
    }

    makeTrainingDisplay (oParentDiv) {
        this.trainingDisplayDiv = createDiv('trainingDisplay', oParentDiv);
        this.trainingDisplayDiv.classList.add('trainingDisplay');
    }

    renderLoadButton (oParentDiv) {
        const oButton = createButton('loadButton', 'Load Data', oParentDiv);
        oButton.onclick = this.loadLabels.bind(this);
    }

    renderSaveButton (oParentDiv) {
        const oButton = createButton('saveButton', 'Save', oParentDiv);
        oButton.onclick = this.saveLabels.bind(this);
    }

    renderClassifyButton (oParentDiv) {
        const oButton = createButton(
            'classifyButton',
            'Start Training',
            oParentDiv,
        );
        oButton.onclick = this.classifyButtonTap.bind(this);
    }

    movePicture () {
        const sValue = this.navigationField.value;
        const iValue = parseInt(sValue);

        this.decimal = LabelMaker.getValidDecimalValue(iValue);

        this.renderPicture();
        this.renderDotColors();
    }

    incrementPicture (iIncrement) {
        if (Math.abs(iIncrement) === 1) {
            this.decimal = LabelMaker.getValidDecimalValue(
                this.decimal + iIncrement,
            );
            this.navigationField.value = this.decimal;

            this.renderPicture();
            this.renderDotColors();
        }
    }

    setLabel (iLabel) {
        const sLabel = LabelMaker.getValidLabelString(iLabel);
        const sCurrentLabel = this.labellist[this.decimal].label;

        if (sLabel === sCurrentLabel) {
            this.labellist[this.decimal].label = 'unlabelled';
            this.renderDotColors();
            this.renderLabelCounts();
        } else if (sLabel === 'no') {
            this.labellist[this.decimal].label = sLabel;
            this.renderDotColors();
            this.renderLabelCounts();
            this.incrementPicture(1);
        } else {
            this.labellist[this.decimal].label = sLabel;
            this.renderDotColors();
            this.renderLabelCounts();
        }
    }

    getLabelCount (sLabel) {
        let iLabelCount = 0;
        const sValidLabel =
            LabelMaker.labels()[sLabel] === undefined ? 'unlabelled' : sLabel;
        for (let i = 0; i < this.labellist.length; i++) {
            const oLabelData = this.labellist[i];
            if (oLabelData.label === sValidLabel) {
                iLabelCount++;
            }
        }
        return iLabelCount;
    }

    loadLabels () {
        loadJsonFromFile('resources/labellist.json')
            .then((oResponse) => {
                if (!oResponse.ok) {
                    throw new Error(`http error ${oResponse.status}`);
                }
                return oResponse.json();
            })
            .then((sResponseJson) => {
                this.labellist = sResponseJson;
                this.moveToClosestByLabelName(LabelMaker.sides().right, 'yes');
                this.renderDotColors();
                this.renderLabelCounts();
            })
            .catch((oError) => {
                this.dataError = true;
            });
    }

    saveLabels () {
        saveJsonToFile(this.labellist, 'labellist.json');
    }

    classifyButtonTap () {
        const aLabelList = convertToMatrix(this.labellist);
        this.classifyWorker.postMessage({
            command: 'start',
            payload: { labelList: aLabelList, options: {} },
        });
    }

    drawAsSquare (sSample) {
        const iBoxLength = BOX_SIZE ** 2;

        if (sSample.length < iBoxLength) {
            return;
        }

        let sColor = '';
        let iState = 0;

        let x = 0;
        let y = 0;
        for (let i = 0; i < iBoxLength; i++) {
            x = i % BOX_SIZE;
            y = Math.floor(i / BOX_SIZE);
            sColor = sSample.substring(i, i + 1);
            iState = parseInt(sColor);
            this.drawPixel(x, y, iState);
        }
    }

    drawPixel (x, y, iState) {
        if (iState === 0) {
            this.drawPixelOff(x, y);
        } else {
            this.drawPixelOn(x, y);
        }
    }

    drawPixelOn (x, y) {
        this.context.strokeStyle = PICTURE_CANVAS_PIXEL_STROKE_STYLE_ON;
        this.context.lineWidth = '2';

        this.drawShape(LabelMaker.oOutline(x, y));
        this.context.fillStyle = PICTURE_CANVAS_PIXEL_FILL_STYLE_ON;
        this.context.fillRect(
            x * DRAW_BLOCK_SIZE + 4,
            y * DRAW_BLOCK_SIZE + 4,
            x + DRAW_BLOCK_SIZE - 4,
            y + DRAW_BLOCK_SIZE - 4,
        );
    }

    drawPixelOff (x, y) {
        this.context.strokeStyle = PICTURE_CANVAS_PIXEL_STROKE_STYLE_OFF;

        this.context.lineWidth = '2';
        this.drawShape(LabelMaker.oOutline(x, y));
        this.context.fillStyle = PICTURE_CANVAS_PIXEL_FILL_STYLE_OFF;
        this.context.fillRect(
            x * DRAW_BLOCK_SIZE + 4,
            y * DRAW_BLOCK_SIZE + 4,
            x + DRAW_BLOCK_SIZE + 4,
            y + DRAW_BLOCK_SIZE + 4,
        );
    }

    drawShape (oOutline) {
        this.context.beginPath();
        oOutline.path.forEach((oEdge) => {
            this.context.moveTo(oEdge.x1, oEdge.y1);
            this.context.lineTo(oEdge.x2, oEdge.y2);
        });
        this.context.closePath();
        this.context.stroke();
    }

    moveToClosestByLabelName (iSide, sLabelName) {
        const iCurrentLabel = this.decimal;
        let bLabelFound = false;

        if (iSide === LabelMaker.sides().right) {
            for (
                let i = iCurrentLabel + 1;
                i < LabelMaker.getMaxDecimalForBoxSize();
                i++
            ) {
                if (!this.labellist[i]) {
                    return;
                }
                if (this.labellist[i].label === sLabelName) {
                    bLabelFound = true;
                    this.navigationField.value = i;
                    break;
                }
            }
        } else if (iSide === LabelMaker.sides().left) {
            for (let i = iCurrentLabel - 1; i >= 0; i--) {
                if (this.labellist[i].label === sLabelName) {
                    bLabelFound = true;
                    this.navigationField.value = i;
                    break;
                }
            }
        }
        if (bLabelFound) {
            this.movePicture();
        }
    }

    drawAt (oEvent) {
        const oTarget = oEvent ? oEvent.target : null;
        if (oTarget) {
            const x = oEvent.pageX - oTarget.offsetLeft;
            const y = oEvent.pageY - oTarget.offsetTop;

            const nBlockX = Math.floor(x / DRAW_BLOCK_SIZE);
            const nBlockY = Math.floor(y / DRAW_BLOCK_SIZE);

            // converts x, y coordinate to 0 .. 16
            const nPositionInBinaryString = nBlockX + nBlockY * BOX_SIZE;
            let iNewState = 0;
            const sOldBinaryNumber = this.labellist[this.decimal].binary;
            const sPixelColor = sOldBinaryNumber.charAt(
                nPositionInBinaryString,
            );
            if (sPixelColor === '0') {
                iNewState = 1;
            } else {
                iNewState = 0;
            }
            const sNewBinaryNumber =
                sOldBinaryNumber.substring(0, nPositionInBinaryString) +
                iNewState +
                sOldBinaryNumber.substring(nPositionInBinaryString + 1);

            const nDecimal = convertBinaryToDecimal(sNewBinaryNumber);
            this.navigationField.value = nDecimal;
            this.movePicture();

            this.drawPixel(nBlockX, nBlockY, iNewState);
        } else {
            console.error('no click target found');
        }
    }

    updateTrainingDisplay (sMessage) {
        this.trainingDisplayDiv.innerHTML = sMessage;
    }
}

var convertBinaryToDecimal = function (sSample) {
    var nDecimal = 0;

    for (var i = sSample.length - 1; i >= 0; i--) {
        var nExponent = 15 - i;
        var nDigit = sSample.charAt(i);
        nDecimal = nDecimal + 2 ** nExponent * nDigit;
    }

    return nDecimal;
};

var convertDecimalToBinary = function (iDecimal, iPadSize) {
    var sSample = '';
    var iValidPadSize = iPadSize ? iPadSize : 1;

    if (iValidPadSize ** 2 > MAX_EXPONENT) {
        iValidPadSize = MAX_EXPONENT;
    }

    var iMaxPosition = iValidPadSize ** 2 - 1;
    var iRemainder = iDecimal;
    for (var iExponent = iMaxPosition; iExponent >= 0; iExponent--) {
        var iPower = 2 ** iExponent;
        if (iPower <= iRemainder) {
            sSample += '1';
            iRemainder = iRemainder - iPower;
        } else {
            sSample += '0';
        }
    }

    return sSample;
};

var loadJsonFromFile = function (sFilename) {
    return fetch(sFilename);
};

var saveJsonToFile = function (aData, sFilename) {
    var sType = 'application/json';

    var sData = '';
    for (var i = 0; i < aData.length; i++) {
        var oDataElement = aData[i];
        var sDataElement = JSON.stringify(oDataElement);
        if (i < MAX_NUMBER_OF_BOXES) {
            if (i === 0) {
                sData = '[' + sDataElement;
            } else {
                sData = sData + ', ' + sDataElement;
            }
            if (i === aData.length - 1) {
                sData = sData + ']';
            }
        }
    }

    var oFile = new Blob([sData], { type: sType });
    var sUrl = URL.createObjectURL(oFile);
    var oAnchorElement = createAnchor('download', 'download', sUrl);
    oAnchorElement.download = sFilename;
    oAnchorElement.click();

    setTimeout(function () {
        document.body.removeChild(oAnchorElement);
        window.URL.revokeObjectURL(sUrl);
    }, 0);
};

export { LabelMaker };
