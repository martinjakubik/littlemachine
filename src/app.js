import { createButton } from './learnhypertext.mjs';
import { classify } from './classify.mjs';

const MAX_EXPONENT = 4096;
const MAX_NUMBER_OF_BOXES = 65536;
const BOX_SIZE = 4;

const MIN_DECIMAL = 0;

const PICTURE_CANVAS_WIDTH = BOX_SIZE;
const PICTURE_CANVAS_HEIGHT = BOX_SIZE;
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

    static oInterlace1 (x, y) {
        const iSpace1 = DRAW_BLOCK_SIZE / 8;
        const iSpace2 = DRAW_BLOCK_SIZE / 8;
        const aPath = [];
        let oPoint = {};
        for (let i = 1; i < 4; i++) {
            oPoint = {
                x1: x * DRAW_BLOCK_SIZE + iSpace2,
                y1: y * DRAW_BLOCK_SIZE + DRAW_BLOCK_SIZE - 2 * i * iSpace1 - 2,
                x2: x * DRAW_BLOCK_SIZE + DRAW_BLOCK_SIZE - iSpace2,
                y2: y * DRAW_BLOCK_SIZE + DRAW_BLOCK_SIZE - 2 * i * iSpace1 - 2,
            };
            aPath.push(oPoint);
        }
        return {
            x: x,
            y: y,
            path: aPath,
        };
    }

    static oInterlace2 (x, y) {
        const iSpace1 = DRAW_BLOCK_SIZE / 8;
        const iSpace2 = DRAW_BLOCK_SIZE / 8;
        const aPath = [];
        let oPoint = {};
        for (let i = 1; i < 4; i++) {
            oPoint = {
                x1: x * DRAW_BLOCK_SIZE + iSpace2,
                y1: y * DRAW_BLOCK_SIZE + DRAW_BLOCK_SIZE - 2 * i * iSpace1 + 4,
                x2: x * DRAW_BLOCK_SIZE + DRAW_BLOCK_SIZE - iSpace2,
                y2: y * DRAW_BLOCK_SIZE + DRAW_BLOCK_SIZE - 2 * i * iSpace1 + 4,
            };
            aPath.push(oPoint);
        }
        return {
            x: x,
            y: y,
            path: aPath,
        };
    }

    constructor () {
        this.decimal = LabelMaker.getValidDecimalValue(0);
        this.labellist = LabelMaker.makeLabelList();
        this.classifyWorker = new Worker('./classify.mjs', { type: 'module' });
    }

    renderMainView () {
        this.navigationField = this.makeNavigationField();
        this.navigationField.setAttribute('value', this.decimal);

        const oContainer = document.createElement('div');
        oContainer.classList.add('container');
        document.body.appendChild(oContainer);

        this.renderPictureNavigator(oContainer);
        this.renderLabelControl(oContainer);
        this.renderLoadButton(oContainer);
        this.renderClassifyButton(oContainer);
        this.renderSaveButton(oContainer);
        this.makeTrainingDisplay(oContainer);
    }

    renderPictureThumbnails (oParentDiv) {
        const oPictureThumbnails = document.createElement('div');
        oPictureThumbnails.classList.add('pictureThumbnails');
        const nNumberOfThumbnails = 200;
        const nStep = MAX_NUMBER_OF_BOXES / nNumberOfThumbnails;
        let oPicture, sPictureFilename;
        for (
            let nPicture = 0;
            nPicture < MAX_NUMBER_OF_BOXES;
            nPicture = nPicture + nStep
        ) {
            oPicture = document.createElement('img');
            oPicture.classList.add('samplePicture');
            sPictureFilename = convertDecimalToBinary(nPicture, 4);
            oPicture.src = `./resources/png16/${sPictureFilename}.png`;
            oPictureThumbnails.appendChild(oPicture);
        }
        oParentDiv.appendChild(oPictureThumbnails);
    }

    renderPictureNavigator (oParentDiv) {
        const oPictureNavigator = document.createElement('div');
        oPictureNavigator.setAttribute('id', 'picturenavigator');
        oPictureNavigator.classList.add('picturenavigator');

        const oButtonLeft = this.makeNavigationButton(LabelMaker.sides().left);
        const oCanvas = this.makeCanvas();
        const oButtonRight = this.makeNavigationButton(
            LabelMaker.sides().right,
        );

        oPictureNavigator.appendChild(oButtonLeft);
        oPictureNavigator.appendChild(oCanvas);
        oPictureNavigator.appendChild(oButtonRight);
        oPictureNavigator.appendChild(this.navigationField);

        oParentDiv.appendChild(oPictureNavigator);

        this.canvasPosition = {
            top: oCanvas.offsetTop,
            left: oCanvas.offsetLeft,
        };
    }

    renderPicture () {
        const i = this.decimal;
        const sSample = convertDecimalToBinary(i, BOX_SIZE);
        this.drawAsSquare(sSample);
    }

    renderLabelControl (oParentDiv) {
        const oLabelControl = document.createElement('div');
        oLabelControl.setAttribute('id', 'labelcontrol');
        oLabelControl.classList.add('labelcontrol');

        const oLabelDots = document.createElement('div');
        oLabelDots.setAttribute('id', 'labeldots');
        oLabelDots.classList.add('labeldots');

        this.dotYes = this.makeLabelDot(LabelMaker.labels().yes);
        this.dotNo = this.makeLabelDot(LabelMaker.labels().no);

        this.renderDotColors();

        const oButtonYes = this.makeLabelButton(LabelMaker.labels().yes);
        const oButtonNo = this.makeLabelButton(LabelMaker.labels().no);

        oLabelDots.appendChild(this.dotYes);
        oLabelDots.appendChild(this.dotNo);

        const oLabelCountGroupYes = this.makeLabelCountGroup('yes');
        const oLabelCountGroupNo = this.makeLabelCountGroup('no');
        const oLabelCountGroupUnlabelled =
            this.makeLabelCountGroup('unlabelled');

        oLabelControl.appendChild(oLabelDots);
        oLabelControl.appendChild(oButtonYes);
        oLabelControl.appendChild(oButtonNo);

        oLabelControl.appendChild(oLabelCountGroupYes);
        oLabelControl.appendChild(oLabelCountGroupNo);
        oLabelControl.appendChild(oLabelCountGroupUnlabelled);

        oParentDiv.appendChild(oLabelControl);
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

    makeCanvas () {
        const oCanvas = document.createElement('canvas');

        oCanvas.setAttribute('id', PICTURE_CANVAS_ID);
        oCanvas.setAttribute('width', PICTURE_CANVAS_WIDTH * DRAW_BLOCK_SIZE);
        oCanvas.setAttribute('height', PICTURE_CANVAS_HEIGHT * DRAW_BLOCK_SIZE);
        oCanvas.addEventListener('click', this.drawAt.bind(this), false);

        this.context = oCanvas.getContext('2d');
        this.context.fillStyle = 'black';
        this.context.fillRect(
            0,
            0,
            PICTURE_CANVAS_WIDTH * DRAW_BLOCK_SIZE,
            PICTURE_CANVAS_HEIGHT * DRAW_BLOCK_SIZE,
        );

        this.context.lineWidth = '2';

        return oCanvas;
    }

    makeNavigationButton (iSide, sLabelName) {
        const oButton = document.createElement('button');

        const sSide = iSide === LabelMaker.sides().left ? 'left' : 'right';

        let sButtonClass;
        let sButtonId;
        if (sLabelName) {
            sButtonClass = 'labelnamenavigationbutton';
            sButtonId = `labelnamenavigationbutton${sLabelName}${sSide}`;
            oButton.onclick = this.moveToClosestByLabelName.bind(
                this,
                iSide,
                sLabelName,
            );
        } else {
            const iIncrement = iSide === LabelMaker.sides().left ? -1 : 1;
            sButtonClass = 'navigationbutton';
            sButtonId = `navigationbutton${sSide}`;
            oButton.onclick = this.incrementPicture.bind(this, iIncrement);
        }
        oButton.classList.add(sButtonClass);

        const sButtonSideClass = `navigationbutton${sSide}`;
        const sButtonLabelNameSideClass = `labelnamenavigationbutton${sSide}`;
        oButton.classList.add(sButtonSideClass);
        oButton.classList.add(sButtonLabelNameSideClass);

        oButton.setAttribute('id', sButtonId);
        return oButton;
    }

    makeNavigationField () {
        const oField = document.createElement('input');

        const sFieldClass = 'navigationfield';
        const sFieldId = 'navigationfield';
        oField.classList.add(sFieldClass);
        oField.setAttribute('id', sFieldId);
        oField.onchange = this.movePicture.bind(this);

        return oField;
    }

    makeLabelDot (iLabel) {
        const oDot = document.createElement('div');

        const sLabel = iLabel === LabelMaker.labels().yes ? 'yes' : 'no';

        const sDotClass = 'labeldot';
        const sDotId = `labeldot${sLabel}`;
        oDot.classList.add(sDotClass);
        oDot.setAttribute('id', sDotId);

        return oDot;
    }

    makeLabelButton (iLabel) {
        const oButton = document.createElement('button');

        const sLabel = iLabel === LabelMaker.labels().yes ? 'yes' : 'no';

        const sButtonClass = 'labelbutton';
        const sButtonId = `labelbutton${sLabel}`;
        oButton.classList.add(sButtonClass);
        oButton.setAttribute('id', sButtonId);
        oButton.onclick = this.setLabel.bind(this, iLabel);

        return oButton;
    }

    makeLabelCountGroup (sLabelName) {
        const labelCountGroup = document.createElement('div');
        labelCountGroup.setAttribute('id', `labelcountgroup${sLabelName}`);
        labelCountGroup.classList.add('labelcountgroup');

        const labelCountLabel = document.createElement('div');
        labelCountLabel.setAttribute('id', `labelcountname${sLabelName}`);
        labelCountLabel.classList.add('labelcountname');
        labelCountLabel.textContent = sLabelName;

        const sCamelCaseLabelName = `labelCount${sLabelName.substring(0, 1).toUpperCase()}${sLabelName.substring(1)}`;
        this[sCamelCaseLabelName] = document.createElement('div');
        this[sCamelCaseLabelName].setAttribute('id', `labelcount${sLabelName}`);
        this[sCamelCaseLabelName].classList.add('labelcount');
        this[sCamelCaseLabelName].textContent = this.getLabelCount(sLabelName);

        const oButtonNextByLabel = this.makeNavigationButton(
            LabelMaker.sides().right,
            sLabelName,
        );
        const oButtonPreviousByLabel = this.makeNavigationButton(
            LabelMaker.sides().left,
            sLabelName,
        );

        labelCountGroup.appendChild(oButtonPreviousByLabel);
        labelCountGroup.appendChild(labelCountLabel);
        labelCountGroup.appendChild(this[sCamelCaseLabelName]);
        labelCountGroup.appendChild(oButtonNextByLabel);

        return labelCountGroup;
    }

    makeTrainingDisplay (oParentDiv) {
        this.trainingDisplayDiv = document.createElement('div');
        this.trainingDisplayDiv.classList.add('trainingDisplay');
        oParentDiv.appendChild(this.trainingDisplayDiv);
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
        this.classifyWorker.postMessage({
            command: 'start',
            payload: { labelList: this.labellist, options: {} },
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
        this.context.strokeStyle = '#efefef';
        this.context.lineWidth = '2';

        this.drawShape(LabelMaker.oOutline(x, y));

        this.context.lineWidth = '6';
        this.drawShape(LabelMaker.oInterlace1(x, y));

        this.context.strokeStyle = '#404040';
        this.drawShape(LabelMaker.oInterlace2(x, y));
    }

    drawPixelOff (x, y) {
        this.context.strokeStyle = 'black';

        this.context.lineWidth = '2';
        this.drawShape(LabelMaker.oOutline(x, y));

        this.context.lineWidth = '6';
        this.drawShape(LabelMaker.oInterlace1(x, y));
        this.drawShape(LabelMaker.oInterlace2(x, y));
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

    updateTrainingDisplay (oDisplayObject) {
        this.trainingDisplayDiv.innerHTML = oDisplayObject.i;
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
    var oAnchorElement = document.createElement('a');
    var sUrl = URL.createObjectURL(oFile);

    oAnchorElement.href = sUrl;
    oAnchorElement.download = sFilename;
    document.body.appendChild(oAnchorElement);
    oAnchorElement.click();

    setTimeout(function () {
        document.body.removeChild(oAnchorElement);
        window.URL.revokeObjectURL(sUrl);
    }, 0);
};

var oLabelMaker = new LabelMaker();

oLabelMaker.renderMainView();
oLabelMaker.renderPicture();
