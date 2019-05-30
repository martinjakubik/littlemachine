/* global require */
requirejs(['Tools'], function (Tools) {

    'use strict';

    var MAX_EXPONENT = 4096;
    var MAX_NUMBER_OF_BOXES = 65536;
    var BOX_SIZE = 4;

    var MIN_DECIMAL = 0;

    var PICTURE_CANVAS_WIDTH = BOX_SIZE;
    var PICTURE_CANVAS_HEIGHT = BOX_SIZE;
    var DRAW_BLOCK_SIZE = 48;

    var PICTURE_CANVAS_ID = 'picturecanvas';

    class LabelMaker {

        static sides() {
            return {
                left: 0,
                right: 1
            }
        };

        static labels() {
            return {
                yes: 0,
                no: 1
            }
        };

        static getValidLabelString(iLabel) {

            var sLabel = 'unlabelled';
            var oValidLabels = LabelMaker.labels();
            var aValidLabelKeys = Object.getOwnPropertyNames(oValidLabels);
            for (var i = 0; i < aValidLabelKeys.length; i++) {
                var sValidLabelKey = aValidLabelKeys[i];
                var iValidLabel = oValidLabels[sValidLabelKey];
                if (iLabel === iValidLabel) {
                    sLabel = sValidLabelKey;
                    break;
                }
            }

            return sLabel;

        }

        static getMaxDecimalForBoxSize() {
            return 2 ** (BOX_SIZE ** 2);
        }

        /**
         * validates if a value is valid for the decimal
         * @param {*} iNewDecimalValue a proposed decimal value
         * @returns the closest valid decimal value
         */
        static getValidDecimalValue(iNewDecimalValue) {

            if (MIN_DECIMAL <= iNewDecimalValue && iNewDecimalValue <= LabelMaker.getMaxDecimalForBoxSize()) {
                return iNewDecimalValue;
            }

            if (iNewDecimalValue > LabelMaker.getMaxDecimalForBoxSize()) {
                return LabelMaker.getMaxDecimalForBoxSize();
            }

            if (iNewDecimalValue < MIN_DECIMAL) {
                return MIN_DECIMAL;
            }

        }

        static makeLabelList() {

            var aLabelList = [];
            for (var i = 0; i < LabelMaker.getMaxDecimalForBoxSize(); i++) {
                var oLabel = {
                    binary: convertDecimalToBinary(i, BOX_SIZE),
                    label: 'unlabelled'
                }
                aLabelList.push(oLabel);
            }
            return aLabelList;

        }

        static borderWidth = 1;

        static oOutline(x ,y) {
            const nCorner = 4;

            return {
                x: x,
                y: y,
                path: [{
                    x1: x * DRAW_BLOCK_SIZE + LabelMaker.borderWidth + nCorner,
                    y1: y * DRAW_BLOCK_SIZE + LabelMaker.borderWidth,
                    x2: (x + 1) * DRAW_BLOCK_SIZE - LabelMaker.borderWidth - nCorner,
                    y2: y * DRAW_BLOCK_SIZE + LabelMaker.borderWidth
                },
                {
                    x1: (x + 1) * DRAW_BLOCK_SIZE - LabelMaker.borderWidth,
                    y1: y * DRAW_BLOCK_SIZE + LabelMaker.borderWidth + nCorner,
                    x2: (x + 1) * DRAW_BLOCK_SIZE - LabelMaker.borderWidth,
                    y2: (y + 1) * DRAW_BLOCK_SIZE - LabelMaker.borderWidth - nCorner
                },
                {
                    x1: (x + 1) * DRAW_BLOCK_SIZE - LabelMaker.borderWidth - nCorner,
                    y1: (y + 1) * DRAW_BLOCK_SIZE - LabelMaker.borderWidth,
                    x2: x * DRAW_BLOCK_SIZE + LabelMaker.borderWidth + nCorner,
                    y2: (y + 1) * DRAW_BLOCK_SIZE - LabelMaker.borderWidth
                },
                {
                    x1: x * DRAW_BLOCK_SIZE + LabelMaker.borderWidth,
                    y1: (y + 1) * DRAW_BLOCK_SIZE - LabelMaker.borderWidth - nCorner,
                    x2: x * DRAW_BLOCK_SIZE + LabelMaker.borderWidth,
                    y2: y * DRAW_BLOCK_SIZE + LabelMaker.borderWidth + nCorner
                }
            ]};
        };

        constructor() {

            this.decimal = LabelMaker.getValidDecimalValue(0);
            this.labellist = LabelMaker.makeLabelList();

        }

        /**
         * main renderer: renders everything
         */
        renderMainView() {

            this.navigationField = this.makeNavigationField();
            this.navigationField.setAttribute('value', this.decimal);

            this.renderPictureNavigator();
            this.renderLabelControl();
            this.renderFileControl();

        }

        /**
         * renders the picture, the navigation buttons and the navigation field
         */
        renderPictureNavigator() {
            
            var oPictureNavigator = document.createElement('div');
            oPictureNavigator.setAttribute('id', 'picturenavigator');
            Tools.setClass(oPictureNavigator, 'picturenavigator');

            var oButtonLeft = this.makeNavigationButton(LabelMaker.sides().left);
            var oCanvas = this.makeCanvas();
            var oButtonRight = this.makeNavigationButton(LabelMaker.sides().right);

            oPictureNavigator.insertBefore(oButtonLeft, null);
            oPictureNavigator.insertBefore(oCanvas, null);
            oPictureNavigator.insertBefore(oButtonRight, null);
            oPictureNavigator.insertBefore(this.navigationField, null);

            document.body.insertBefore(oPictureNavigator, null);

            this.canvasPosition = {
                top: oCanvas.offsetTop,
                left: oCanvas.offsetLeft
            };

        }

        /**
         * renders the picture as a box
         */
        renderPicture() {

            var i = this.decimal;
            var sBinary = convertDecimalToBinary(i, BOX_SIZE);
            this.drawAsSquare(sBinary);

        };

        /**
         * renders the labels and the buttons to set the labels
         */
        renderLabelControl() {

            var oLabelControl = document.createElement('div');
            oLabelControl.setAttribute('id', 'labelcontrol');
            Tools.setClass(oLabelControl, 'labelcontrol');

            var oLabelDots = document.createElement('div');
            oLabelDots.setAttribute('id', 'labeldots');
            Tools.setClass(oLabelDots, 'labeldots');

            this.dotYes = this.makeLabelDot(LabelMaker.labels().yes);
            this.dotNo = this.makeLabelDot(LabelMaker.labels().no);

            this.renderDotColors();

            var oButtonYes = this.makeLabelButton(LabelMaker.labels().yes);
            var oButtonNo = this.makeLabelButton(LabelMaker.labels().no);

            oLabelDots.insertBefore(this.dotYes, null);
            oLabelDots.insertBefore(this.dotNo, null);

            var oLabelCountGroupYes = this.makeLabelCountGroup('yes');
            var oLabelCountGroupNo = this.makeLabelCountGroup('no');
            var oLabelCountGroupUnlabelled = this.makeLabelCountGroup('unlabelled');

            oLabelControl.insertBefore(oLabelDots, null);
            oLabelControl.insertBefore(oButtonYes, null);
            oLabelControl.insertBefore(oButtonNo, null);

            oLabelControl.insertBefore(oLabelCountGroupYes, null);
            oLabelControl.insertBefore(oLabelCountGroupNo, null);
            oLabelControl.insertBefore(oLabelCountGroupUnlabelled, null);

            document.body.insertBefore(oLabelControl, null);

        }

        renderFileControl() {

            var oButtonLoad = this.makeLoadButton();
            var oButtonSave = this.makeSaveButton();

            document.body.insertBefore(oButtonLoad, null);
            document.body.insertBefore(oButtonSave, null);

        }

        /**
         * renders the colors on the labelling dots
         */
        renderDotColors() {

            if (this.labellist[this.decimal].label === 'yes') {
                Tools.removeClass(this.dotNo, 'on');
                Tools.addClass(this.dotYes, 'on');
            } else if (this.labellist[this.decimal].label === 'no') {
                Tools.removeClass(this.dotYes, 'on');
                Tools.addClass(this.dotNo, 'on');
            } else {
                Tools.removeClass(this.dotYes, 'on');
                Tools.removeClass(this.dotNo, 'on');
            }

        }

        /**
         * renders the counts of all the labels
         */
        renderLabelCounts() {

            this.labelCountYes.textContent = this.getLabelCount('yes');
            this.labelCountNo.textContent = this.getLabelCount('no');
            this.labelCountUnlabelled.textContent = this.getLabelCount('unlabelled');

        }

        makeCanvas() {

            var oCanvas = document.createElement('canvas');
    
            oCanvas.setAttribute('id', PICTURE_CANVAS_ID);
            oCanvas.setAttribute('width', PICTURE_CANVAS_WIDTH * DRAW_BLOCK_SIZE);
            oCanvas.setAttribute('height', PICTURE_CANVAS_HEIGHT * DRAW_BLOCK_SIZE);
            oCanvas.addEventListener('click', this.drawAt.bind(this), false);

            this.context = oCanvas.getContext("2d");
            this.context.fillStyle = "black";
            this.context.fillRect(0, 0, PICTURE_CANVAS_WIDTH * DRAW_BLOCK_SIZE, PICTURE_CANVAS_HEIGHT * DRAW_BLOCK_SIZE);

            return oCanvas;

        }

        makeNavigationButton(iSide, sLabelName) {
            
            var oButton = document.createElement('button');
            
            var sSide = iSide === LabelMaker.sides().left ? 'left' : 'right';

            if (sLabelName) {
                
                var sButtonClass = 'labelnamenavigationbutton';
                var sButtonId = `labelnamenavigationbutton${sLabelName}${sSide}`;
                oButton.onclick = this.moveToClosestByLabelName.bind(this, iSide, sLabelName);
                
            } else {

                var iIncrement = iSide === LabelMaker.sides().left ? -1 : 1;
                var sButtonClass = 'navigationbutton';
                var sButtonId = `navigationbutton${sSide}`;
                oButton.onclick = this.incrementPicture.bind(this, iIncrement);
                
            }
            Tools.setClass(oButton, sButtonClass);

            var sButtonSideClass = `navigationbutton${sSide}`;
            var sButtonLabelNameSideClass = `labelnamenavigationbutton${sSide}`;
            Tools.addClass(oButton, sButtonSideClass);
            Tools.addClass(oButton, sButtonLabelNameSideClass);

            oButton.setAttribute('id', sButtonId);
            return oButton;

        }

        makeNavigationField() {

            var oField = document.createElement('input');

            var sFieldClass = 'navigationfield';
            var sFieldId = 'navigationfield';
            Tools.setClass(oField, sFieldClass);
            oField.setAttribute('id', sFieldId);
            oField.onchange = this.movePicture.bind(this);

            return oField;

        }

        makeLabelDot(iLabel) {

            var oDot = document.createElement('div');

            var sLabel = iLabel === LabelMaker.labels().yes ? 'yes' : 'no';

            var sDotClass = 'labeldot';
            var sDotId = `labeldot${sLabel}`;
            Tools.setClass(oDot, sDotClass);
            oDot.setAttribute('id', sDotId);

            return oDot;

        }

        makeLabelButton(iLabel) {

            var oButton = document.createElement('button');

            var sLabel = iLabel === LabelMaker.labels().yes ? 'yes' : 'no';

            var sButtonClass = 'labelbutton';
            var sButtonId = `labelbutton${sLabel}`;
            Tools.setClass(oButton, sButtonClass);
            oButton.setAttribute('id', sButtonId);
            oButton.onclick = this.setLabel.bind(this, iLabel);

            return oButton;

        }

        makeLabelCountGroup(sLabelName) {

            var labelCountGroup = document.createElement('div');
            labelCountGroup.setAttribute('id', `labelcountgroup${sLabelName}`);
            Tools.setClass(labelCountGroup, 'labelcountgroup');

            var labelCountLabel = document.createElement('span');
            labelCountLabel.setAttribute('id', `labelcountname${sLabelName}`);
            Tools.setClass(labelCountLabel, 'labelcountname');
            labelCountLabel.textContent = sLabelName;

            var sCamelCaseLabelName = `labelCount${sLabelName.substring(0, 1).toUpperCase()}${sLabelName.substring(1)}`;
            this[sCamelCaseLabelName] = document.createElement('span');
            this[sCamelCaseLabelName].setAttribute('id', `labelcount${sLabelName}`);
            Tools.setClass(this[sCamelCaseLabelName], 'labelcount');
            this[sCamelCaseLabelName].textContent = this.getLabelCount(sLabelName);

            var oButtonNextByLabel = this.makeNavigationButton(LabelMaker.sides().right, sLabelName);
            var oButtonPreviousByLabel = this.makeNavigationButton(LabelMaker.sides().left, sLabelName);

            labelCountGroup.insertBefore(oButtonPreviousByLabel, null);
            labelCountGroup.insertBefore(labelCountLabel, null);
            labelCountGroup.insertBefore(this[sCamelCaseLabelName], null);
            labelCountGroup.insertBefore(oButtonNextByLabel, null);

            return labelCountGroup;

        }

        makeLoadButton() {

            var oButton = document.createElement('button');

            var sButtonClass = 'loadbutton';
            var sButtonId = 'loadbutton';
            Tools.setClass(oButton, sButtonClass);
            oButton.setAttribute('id', sButtonId);
            oButton.onclick = this.loadLabels.bind(this);

            return oButton;

        }

        makeSaveButton() {

            var oButton = document.createElement('button');

            var sButtonClass = 'savebutton';
            var sButtonId = 'savebutton';
            Tools.setClass(oButton, sButtonClass);
            oButton.setAttribute('id', sButtonId);
            oButton.onclick = this.saveLabels.bind(this);

            return oButton;

        }

        /**
         * moves the picture to the decimal value in the navigation field
         */
        movePicture() {

            var sValue = this.navigationField.value;
            var iValue = parseInt(sValue);

            this.decimal = LabelMaker.getValidDecimalValue(iValue)

            this.renderPicture();
            this.renderDotColors();

        }

        /**
         * moves the picture up or down by one decimal
         * @param {*} iIncrement the value to move by: either 1 or -1
         */
        incrementPicture(iIncrement) {

            if (Math.abs(iIncrement) === 1) {
                this.decimal = LabelMaker.getValidDecimalValue(this.decimal + iIncrement);
                this.navigationField.value = this.decimal;

                this.renderPicture();
                this.renderDotColors();
            }

        }

        /**
         * sets the label for the current picture
         * @param {*} iLabel the label to set, as an enumerated value
         */
        setLabel(iLabel) {

            var sLabel = LabelMaker.getValidLabelString(iLabel);
            var sCurrentLabel = this.labellist[this.decimal].label;

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

        /**
         * gets the count of labels for the given label
         * @param {*} sLabel 
         */
        getLabelCount(sLabel) {

            var iLabelCount = 0;
            var sValidLabel = LabelMaker.labels()[sLabel] === undefined ? 'unlabelled' : sLabel;
            for (var i = 0; i < this.labellist.length; i++) {
                var oLabelData = this.labellist[i];
                if (oLabelData.label === sValidLabel) {
                    iLabelCount++;
                }
            }
            return iLabelCount;

        }

        /**
         * loads the list of labels from a file
         */
        loadLabels() {

            loadJsonFromFile('labellists/labellist.json')
                .then(oResponse => {
                    if (!oResponse.ok) {
                        throw new Error(`http error ${oResponse.status}`);
                    }
                    return oResponse.json();
                })
                .then(sResponseJson => {
                    this.labellist = sResponseJson;
                    this.renderDotColors();
                    this.renderLabelCounts();
                })
                .catch(oError => {
                    this.dataError = true;
                });

        }

        /**
         * saves the list of labels to a file
         */
        saveLabels() {

            saveJsonToFile(this.labellist, 'labellist.json');

        }

        /**
         * draws a binary value as a square
         * @param {*} sBinary a string with a binary value
         */
        drawAsSquare(sBinary) {

            var iBoxLength = BOX_SIZE ** 2;

            if (sBinary.length < iBoxLength) {
                return;
            }

            var sColor = '';
            var iState = 0;

            var x = 0;
            var y = 0;
            for (var i = 0; i < iBoxLength; i++) {
                x = i % BOX_SIZE;
                y = Math.floor(i / BOX_SIZE);
                sColor = sBinary.substring(i, i + 1);
                iState = parseInt(sColor);
                this.drawPixel(x, y, iState);
            }

        };

        /**
         * draws one pixel at a given position with the given color
         * @param {*} x an x position as an integer
         * @param {*} y a y position as an integer
         * @param {*} iState flag indicating that pixel is on if 1; otherwise off
         */
        drawPixel(x, y, iState) {
            if (iState === 0) {
                this.drawPixelOff(x, y);
            } else {
                this.drawPixelOn(x, y);
            }           
        }
        
        drawPixelOn(x, y) {

            this.context.fillStyle = 'green' ;
            this.context.strokeStyle = 'green';

            this.drawPixelOutline(LabelMaker.oOutline(x, y));
            
            var nBorderWidth = LabelMaker.borderWidth;
            this.context.fillRect(x * DRAW_BLOCK_SIZE + nBorderWidth, y * DRAW_BLOCK_SIZE + nBorderWidth, DRAW_BLOCK_SIZE - (2 * nBorderWidth), DRAW_BLOCK_SIZE - (2 * nBorderWidth));
        }
        
        drawPixelOff(x, y) {

            this.context.fillStyle = 'black' ;
            this.context.strokeStyle = 'black';

            this.drawPixelOutline(LabelMaker.oOutline(x, y));

            var nBorderWidth = LabelMaker.borderWidth;
            this.context.fillRect(x * DRAW_BLOCK_SIZE + nBorderWidth, y * DRAW_BLOCK_SIZE + nBorderWidth, DRAW_BLOCK_SIZE - (2 * nBorderWidth), DRAW_BLOCK_SIZE - (2 * nBorderWidth));

       }     

        drawPixelOutline(oOutline) {

            this.context.beginPath();
            oOutline.path.forEach(oEdge => {
                this.context.moveTo(oEdge.x1, oEdge.y1);
                this.context.lineTo(oEdge.x2, oEdge.y2);
            })    
            this.context.closePath();
            this.context.stroke();

        }    

        moveToClosestByLabelName(iSide, sLabelName) {

            var iCurrentLabel = this.decimal;

            if (iSide === LabelMaker.sides().right) {
                for (var i = iCurrentLabel + 1; i < LabelMaker.getMaxDecimalForBoxSize(); i++) {
                    if(this.labellist[i].label === sLabelName) {
                        this.navigationField.value = i;
                        break;
                    }
                }
            } else if (iSide === LabelMaker.sides().left) {
                for (var i = iCurrentLabel - 1; i >= 0; i--) {
                    if(this.labellist[i].label === sLabelName) {
                        this.navigationField.value = i;
                        break;
                    }
                }
                }
            this.movePicture();

        }

        drawAt(oEvent) {

            var x = oEvent.pageX - this.canvasPosition.left;
            var y = oEvent.pageY - this.canvasPosition.top;

            var nBlockX = Math.floor(x / DRAW_BLOCK_SIZE);
            var nBlockY = Math.floor(y / DRAW_BLOCK_SIZE);

            // converts x, y coordinate to 0 .. 16
            var nPositionInBinaryString = (nBlockX) + (nBlockY * BOX_SIZE);
            var iNewState = 0;
            var sOldBinaryNumber = this.labellist[this.decimal].binary;
            var sPixelColor = sOldBinaryNumber.charAt(nPositionInBinaryString);
            if (sPixelColor === '0') {
                iNewState = 1;
            } else {
                iNewState = 0;
            }
            var sNewBinaryNumber = sOldBinaryNumber.substring(0, nPositionInBinaryString) + iNewState + sOldBinaryNumber.substring(nPositionInBinaryString + 1);

            var nDecimal = convertBinaryToDecimal(sNewBinaryNumber);
            this.navigationField.value = nDecimal;
            this.movePicture();
            
            this.drawPixel(nBlockX, nBlockY, iNewState);

        }

    }

    var convertBinaryToDecimal = function (sBinary) {

        var nDecimal = 0;

        for (var i = sBinary.length - 1; i >= 0; i--) {
            var nExponent = 15 - i;
            var nDigit = sBinary.charAt(i);
            nDecimal = nDecimal + (2 ** nExponent) * nDigit;
        }

        return nDecimal;

    }

    /**
     * converts a decimal to a binary
     * @param {int} iDecimal 
     * @param {int} iPadSize 
     * @returns the binary as a string
     */
    var convertDecimalToBinary = function (iDecimal, iPadSize) {

        var sBinary = '';
        var iValidPadSize = iPadSize ? iPadSize : 1;

        if (iValidPadSize ** 2 > MAX_EXPONENT) {
            iValidPadSize = MAX_EXPONENT;
        }

        var iMaxPosition = (iValidPadSize ** 2) - 1;
        var iRemainder = iDecimal;
        for (var iExponent = iMaxPosition; iExponent >= 0; iExponent--) {
            var iPower = 2 ** iExponent;
            if (iPower <= iRemainder) {
                sBinary += '1';
                iRemainder = iRemainder - iPower;
            } else {
                sBinary += '0';
            }
        }

        return sBinary;

    }

    /**
     * loads json data from a file
     * @param {*} sFilename _
     * @returns {Promise} a promise to an array of data
     */
    var loadJsonFromFile = function (sFilename) {

        return fetch(sFilename);

    }

    /**
     * saves json data to a file
     * @param {*} aData array of data
     * @param {*} sFilename _
     */
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

        var oFile = new Blob([sData], {type: sType});
        var oAnchorElement = document.createElement('a');
        var sUrl = URL.createObjectURL(oFile);

        oAnchorElement.href = sUrl;
        oAnchorElement.download = sFilename;
        document.body.appendChild(oAnchorElement);
        oAnchorElement.click();

        setTimeout(function() {
            document.body.removeChild(oAnchorElement);
            window.URL.revokeObjectURL(sUrl);
        }, 0);

    }

    // starts the label maker
    var oLabelMaker = new LabelMaker();

    oLabelMaker.renderMainView();
    oLabelMaker.renderPicture();

})
