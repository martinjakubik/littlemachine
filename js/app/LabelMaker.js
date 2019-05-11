/* global require */
requirejs(['Tools'], function (Tools) {

    'use strict';

    var MAX_EXPONENT = 4096;
    var MAX_NUMBER_OF_BOXES = 65536;
    var BOX_SIZE = 3;

    var MIN_DECIMAL = 0;
    var MAX_DECIMAL = MAX_NUMBER_OF_BOXES;

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

        static makeLabelList() {

            var aLabelList = [];
            for (var i = 0; i < (2 ** BOX_SIZE ** 2); i++) {
                aLabelList.push('unlabelled');
            }
            return aLabelList;

        }

        constructor() {

            this.decimal = 0;
            this.labellist = LabelMaker.makeLabelList();

        }

        renderMainView() {

            this.navigationField = this.makeNavigationField();
            this.navigationField.setAttribute('value', this.decimal);

            this.renderPictureNavigator();
            this.renderLabelControl();

        }
        
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

            var oButtonSave = this.makeSaveButton();

            document.body.insertBefore(oLabelControl, null);
            document.body.insertBefore(oButtonSave, null);

        }

        renderDotColors() {

            if (this.labellist[this.decimal] === 'yes') {
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

        makeSaveButton() {

            var oButton = document.createElement('button');

            var sButtonClass = 'savebutton';
            var sButtonId = 'savebutton';
            Tools.setClass(oButton, sButtonClass);
            oButton.setAttribute('id', sButtonId);
            oButton.onclick = this.saveLabels.bind(this);

            return oButton;

        }

        movePicture() {

            var sValue = this.navigationField.value;
            var iValue = parseInt(sValue);

            if (MIN_DECIMAL <= iValue && iValue < MAX_DECIMAL) {
                this.decimal = iValue;
            }

            this.renderPicture();
            this.renderDotColors();

        }

        incrementPicture(iIncrement) {

            if (Math.abs(iIncrement) === 1) {
                if (MIN_DECIMAL <= this.decimal + iIncrement && this.decimal + iIncrement < MAX_DECIMAL) {
                    this.decimal = this.decimal + iIncrement;
                    this.navigationField.value = this.decimal;

                    this.renderPicture();
                    this.renderDotColors();
                }
            }


        }

        setLabel(iLabel) {

            var sLabel = iLabel === LabelMaker.labels().yes ? 'yes' : 'no';
            this.labellist[this.decimal] = sLabel;
            this.renderDotColors();

        }

        saveLabels() {

            // saves labellist to file
            saveJsonToFile(this.labellist, 'labellist.json');

        }

        renderPicture() {

            var i = this.decimal;
            var sBinary = convertDecimalToBinary(i, BOX_SIZE);
            this.drawAsSquare(sBinary);

        };

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

        if (iPadSize ** 2 > MAX_EXPONENT) {
            iPadSize = MAX_EXPONENT;
        }

        var iMaxPosition = (iPadSize ** 2) - 1;
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
     * saves json data to a file
     * @param {*} aData array of data
     * @param {*} sFilename _
     */
    var saveJsonToFile = function (aData, sFilename) {

        var sType = 'application/json';

        var sData = '';
        for (var i = 0; i < aData.length; i++) {
            var oDataElement = aData[i];
            var oDataJson = {
                index: i,
                label: oDataElement
            };
            var sDataElement = JSON.stringify(oDataJson);
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

    var oLabelMaker = new LabelMaker();

    oLabelMaker.renderMainView();
    oLabelMaker.renderPicture();

})
