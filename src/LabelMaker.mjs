import {
    createAnchor,
    createButton,
    createDiv,
    createNumberInput,
} from './learnhypertext.mjs';
import { convertToMatrix } from './jsonToArrayConverter.js';
import { PixelCanvas } from './PixelCanvas.mjs';
import { DataController } from './datacontroller.mjs';

const MAX_EXPONENT = 4096;
const MAX_NUMBER_OF_SAMPLES = 65536;
const BOX_SIZE = 4;

const MIN_DECIMAL = 0;

const PIXEL_SIZE = 72;

const DATA_PIXEL_CANVAS_ID = 'datapixelcanvas';
const TRAINING_PIXEL_CANVAS_ID = 'trainingpixelcanvas';

const LABEL_UNLABELLED_DB = 'unlabelled';

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
        let sLabel = LABEL_UNLABELLED_DB;
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

    static makeSampleList () {
        const aSampleList = [];
        for (let i = 0; i < LabelMaker.getMaxDecimalForBoxSize(); i++) {
            const oLabel = {
                binary: convertDecimalToBinary(i, BOX_SIZE),
                label: LABEL_UNLABELLED_DB,
            };
            aSampleList.push(oLabel);
        }
        return aSampleList;
    }

    constructor () {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        this.decimal = LabelMaker.getValidDecimalValue(0);
        this.labellist = LabelMaker.makeSampleList();
        this.dataPixelCanvas = new PixelCanvas(
            DATA_PIXEL_CANVAS_ID,
            PIXEL_SIZE,
            BOX_SIZE,
            BOX_SIZE,
        );
        this.trainingPixelCanvas = new PixelCanvas(
            TRAINING_PIXEL_CANVAS_ID,
            PIXEL_SIZE,
            BOX_SIZE,
            BOX_SIZE,
        );

        this.classifyWorker = new Worker('./classify.mjs', { type: 'module' });
        this.classifyWorker.addEventListener('message', (message) => {
            const sMessageType = message.data.type || 'NONE';
            switch (sMessageType) {
            case 'update':
                this.updateTrainingDisplay(message.data);
                break;
            default:
                break;
            }
        });
    }

    makeMainView () {
        const oContainer = createDiv('container');
        oContainer.classList.add('container');

        this.makeSidebar(oContainer);
        this.makeSampleNavigator(oContainer);
        this.makeLabelControl(oContainer);
        this.makeTrainingDisplay(oContainer);
        this.makeLoadButton(oContainer);
        this.makeClassifyButton(oContainer);
        this.makeSaveButton(oContainer);
        this.makeLabelCountGroups(oContainer);
    }

    makeSidebar (oParentDiv) {
        const oSidebarDiv = createDiv('sidebar', oParentDiv);
        const oMenuButton = createButton('menuButton', '⛭', oSidebarDiv);
        oMenuButton.onclick = this.toggleLabelCounts.bind(this);
    }

    toggleLabelCounts () {
        if (this.labelCountGroupDiv.classList.contains('off')) {
            this.labelCountGroupDiv.classList.remove('off');
            this.labelCountGroupDiv.classList.add('on');
        } else {
            this.labelCountGroupDiv.classList.remove('on');
            this.labelCountGroupDiv.classList.add('off');
        }
    }

    makeSampleNavigator (oParentDiv) {
        const oHandlers = {
            onclick: this.drawAt.bind(this),
        };
        const oCanvas = this.dataPixelCanvas.makeCanvas(oParentDiv, oHandlers);
        this.canvasPosition = {
            top: oCanvas.offsetTop,
            left: oCanvas.offsetLeft,
        };

        this.makeNavigationButton(LabelMaker.sides().left, null, oParentDiv, {
            onclick: this.incrementSample.bind(this, -1),
        });

        this.navigationField = this.makeNavigationField(
            {
                onchange: this.moveSample.bind(this),
            },
            oParentDiv,
        );
        this.navigationField.setAttribute('value', this.decimal);

        this.makeNavigationButton(LabelMaker.sides().right, null, oParentDiv, {
            onclick: this.incrementSample.bind(this, 1),
        });
    }

    makeTrainingDisplay (oParentDiv) {
        const oCanvas = this.trainingPixelCanvas.makeCanvas(oParentDiv);
        this.canvasPosition = {
            top: oCanvas.offsetTop,
            left: oCanvas.offsetLeft,
        };
    }

    renderSample () {
        const i = this.decimal;
        const sSample = convertDecimalToBinary(i, BOX_SIZE);
        this.drawSampleAsBox(sSample);
    }

    makeLabelControl (oParentDiv) {
        this.labelButtons = {};
        this.labelButtons[LabelMaker.labels().yes] = this.makeLabelButton(
            LabelMaker.labels().yes,
            oParentDiv,
        );
        this.labelButtons[LabelMaker.labels().no] = this.makeLabelButton(
            LabelMaker.labels().no,
            oParentDiv,
        );
    }

    renderLabelYesNoColors () {
        if (this.labellist[this.decimal].label === 'yes') {
            this.labelButtons[LabelMaker.labels().no].classList.remove('on');
            this.labelButtons[LabelMaker.labels().yes].classList.add('on');
        } else if (this.labellist[this.decimal].label === 'no') {
            this.labelButtons[LabelMaker.labels().yes].classList.remove('on');
            this.labelButtons[LabelMaker.labels().no].classList.add('on');
        } else {
            this.labelButtons[LabelMaker.labels().yes].classList.remove('on');
            this.labelButtons[LabelMaker.labels().no].classList.remove('on');
        }
    }

    renderLabelCounts () {
        this.labelCountYes.textContent = this.getLabelCount('yes');
        this.labelCountNo.textContent = this.getLabelCount('no');
        this.labelCountUnlabelled.textContent =
            this.getLabelCount(LABEL_UNLABELLED_DB);
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

    makeLabelButton (iLabel, oParentDiv) {
        const sLabel = iLabel === LabelMaker.labels().yes ? 'yes' : 'no';
        const sButtonClass = 'labelbutton';
        const sButtonId = `labelbutton${sLabel}`;
        const oButton = createButton(sButtonId, sLabel, oParentDiv);
        oButton.classList.add(sButtonClass);
        oButton.onclick = this.setLabel.bind(this, iLabel);
        return oButton;
    }

    makeLabelCountGroups (oParentDiv) {
        this.labelCountGroupDiv = createDiv('labelcounts', oParentDiv);
        this.labelCountGroupDiv.classList.add('off');
        this.makeLabelCountGroup('yes', this.labelCountGroupDiv);
        this.makeLabelCountGroup('no', this.labelCountGroupDiv);
        this.makeLabelCountGroup(LABEL_UNLABELLED_DB, this.labelCountGroupDiv);
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

    makeLoadButton (oParentDiv) {
        const oButton = createButton('loadButton', 'Load Data', oParentDiv);
        oButton.onclick = this.loadLabels.bind(this);
    }

    makeSaveButton (oParentDiv) {
        const oButton = createButton('saveButton', 'Save', oParentDiv);
        oButton.onclick = this.saveLabels.bind(this);
    }

    makeClassifyButton (oParentDiv) {
        const oButton = createButton(
            'classifyButton',
            'Start Training',
            oParentDiv,
        );
        oButton.onclick = this.classifyButtonTap.bind(this);
    }

    moveSample () {
        const sValue = this.navigationField.value;
        const iValue = parseInt(sValue);

        this.decimal = LabelMaker.getValidDecimalValue(iValue);

        this.renderSample();
        this.renderLabelYesNoColors();
    }

    incrementSample (iIncrement) {
        if (Math.abs(iIncrement) === 1) {
            this.decimal = LabelMaker.getValidDecimalValue(
                this.decimal + iIncrement,
            );
            this.navigationField.value = this.decimal;

            this.renderSample();
            this.renderLabelYesNoColors();
        }
    }

    setLabel (iLabel) {
        const sLabel = LabelMaker.getValidLabelString(iLabel);
        const sCurrentLabel = this.labellist[this.decimal].label;

        if (sLabel === sCurrentLabel) {
            this.labellist[this.decimal].label = LABEL_UNLABELLED_DB;
            this.renderLabelYesNoColors();
            this.renderLabelCounts();
        } else if (sLabel === 'no') {
            this.labellist[this.decimal].label = sLabel;
            this.renderLabelYesNoColors();
            this.renderLabelCounts();
            this.incrementSample(1);
        } else {
            this.labellist[this.decimal].label = sLabel;
            this.renderLabelYesNoColors();
            this.renderLabelCounts();
        }
    }

    getLabelCount (sLabel) {
        let iLabelCount = 0;
        const sValidLabel =
            LabelMaker.labels()[sLabel] === undefined
                ? LABEL_UNLABELLED_DB
                : sLabel;
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
                this.renderLabelYesNoColors();
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
        const aSampleList = convertToMatrix(this.labellist);
        this.classifyWorker.postMessage({
            command: 'start',
            payload: { labelList: aSampleList, options: {} },
        });
    }

    drawSampleAsBox (sSample) {
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
            this.dataPixelCanvas.drawPixel(x, y, iState);
        }
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
            this.moveSample();
        }
    }

    drawAt (oEvent) {
        const oTarget = oEvent ? oEvent.target : null;
        if (oTarget) {
            const x = oEvent.pageX - oTarget.offsetLeft;
            const y = oEvent.pageY - oTarget.offsetTop;

            const nBlockX = Math.floor(x / PIXEL_SIZE);
            const nBlockY = Math.floor(y / PIXEL_SIZE);

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
            this.moveSample();

            this.dataPixelCanvas.drawPixel(nBlockX, nBlockY, iNewState);
        } else {
            console.error('no click target found');
        }
    }

    yPressed () {
        this.setLabel.call(this, LabelMaker.labels().yes);
    }

    nPressed () {
        this.setLabel.call(this, LabelMaker.labels().no);
    }

    leftArrowPressed () {
        this.incrementSample.call(this, -1);
    }

    rightArrowPressed () {
        this.incrementSample.call(this, 1);
    }

    handleKeyDown (event) {
        const keyCode = event.keyCode;
        if (keyCode === 89) {
            this.yPressed.call(this);
            event.preventDefault();
        } else if (keyCode === 78) {
            this.nPressed.call(this);
            event.preventDefault();
        } else if (keyCode === 37) {
            this.leftArrowPressed.call(this);
            event.preventDefault();
        } else if (keyCode === 39) {
            this.rightArrowPressed.call(this);
            event.preventDefault();
        }
    }

    updateTrainingDisplay (oMessageData) {
        const nJ0Rounded = Math.round(oMessageData.j0 * 1000) / 1000;
        const aArrayTheta0Rounded = oMessageData.arrayTheta0._data.map(
            (n) => Math.round(n * 1000) / 1000,
        );
        const sMessage = `i: ${oMessageData.i}, J₀: ${nJ0Rounded}; ϴ: ${aArrayTheta0Rounded.join(', ')}`;
        console.log(sMessage);
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
        if (i < MAX_NUMBER_OF_SAMPLES) {
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
