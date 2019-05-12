/* global require */
requirejs(['Tools'], function (Tools) {

    'use strict';

    var MAX_EXPONENT = 4096;
    var MAX_NUMBER_OF_BOXES = 65536;
    var BOX_SIZE = 3;

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

            oLabelControl.insertBefore(oLabelDots, null);
            oLabelControl.insertBefore(oButtonYes, null);
            oLabelControl.insertBefore(oButtonNo, null);

            var oButtonLoad = this.makeLoadButton();
            var oButtonSave = this.makeSaveButton();

            document.body.insertBefore(oLabelControl, null);
            document.body.insertBefore(oButtonLoad, null);
            document.body.insertBefore(oButtonSave, null);

        }

        /**
         * renders the colors on the labelling dots
         */
        renderDotColors() {

            if (this.labellist[this.decimal].label === 'yes') {
                Tools.removeClass(this.dotYes, 'off');
                Tools.removeClass(this.dotNo, 'on');
                Tools.addClass(this.dotYes, 'on');
                Tools.addClass(this.dotNo, 'off');
            } else {
                Tools.removeClass(this.dotYes, 'on');
                Tools.removeClass(this.dotNo, 'off');
                Tools.addClass(this.dotYes, 'off');
                Tools.addClass(this.dotNo, 'on');
            }

        }

        makeCanvas() {

            var oCanvas = document.createElement('canvas');
    
            oCanvas.setAttribute('id', PICTURE_CANVAS_ID);
            oCanvas.setAttribute('width', PICTURE_CANVAS_WIDTH * DRAW_BLOCK_SIZE);
            oCanvas.setAttribute('height', PICTURE_CANVAS_HEIGHT * DRAW_BLOCK_SIZE);

            this.context = oCanvas.getContext("2d");
            this.context.fillStyle = "black";
            this.context.fillRect(0, 0, PICTURE_CANVAS_WIDTH * DRAW_BLOCK_SIZE, PICTURE_CANVAS_HEIGHT * DRAW_BLOCK_SIZE);

            return oCanvas;

        }

        makeNavigationButton(iSide) {

            var oButton = document.createElement('button');

            var sSide = iSide === LabelMaker.sides().left ? 'left' : 'right';
            var iIncrement = iSide === LabelMaker.sides().left ? -1 : 1;

            var sButtonClass = 'navigationbutton';
            var sButtonId = `navigationbutton${sSide}`;
            Tools.setClass(oButton, sButtonClass);
            oButton.setAttribute('id', sButtonId);
            oButton.onclick = this.incrementPicture.bind(this, iIncrement);

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

            var sLabel = iLabel === LabelMaker.labels().yes ? 'yes' : 'no';
            this.labellist[this.decimal].label = sLabel;
            this.renderDotColors();

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
                    renderDotColors();
                })
                .catch(function() {
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
            var iColor = 0;

            var x = 0;
            var y = 0;
            for (var i = 0; i < iBoxLength; i++) {
                x = i % BOX_SIZE;
                y = Math.floor(i / BOX_SIZE);
                sColor = sBinary.substring(i, i + 1);
                iColor = parseInt(sColor);
                this.drawPixel(x, y, iColor);
            }

        };

        /**
         * draws one pixel at a given position with the given color
         * @param {*} x an x position as an integer
         * @param {*} y a y position as an integer
         * @param {*} iColor a color with 0 = black; otherwise white
         */
        drawPixel(x, y, iColor) {

            if (iColor === 0) {
                this.context.fillStyle = 'black' ;
            } else {
                this.context.fillStyle = 'white' ;
            }
            this.context.fillRect(x * DRAW_BLOCK_SIZE, y * DRAW_BLOCK_SIZE, (x + 1) * DRAW_BLOCK_SIZE, (y + 1) * DRAW_BLOCK_SIZE);

        }

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
