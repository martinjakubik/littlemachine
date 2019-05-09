/* global require */
requirejs(['Tools'], function (Tools) {

    'use strict';

    var MAX_EXPONENT = 4096;
    var MAX_NUMBER_OF_BOXES = 65536;
    var BOX_SIZE = 4;

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

        static labellist = [
            'no',
            'no',
            'no',
            'no',
            'no',
            'no',
            'no',
            'no',
            'no',
            'no',
            'no',
            'no',
            'no'
        ];
        
        constructor() {

            this.decimal = 0;
            this.labellist = LabelMaker.labellist;

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

            var oButtonYes = this.makeLabelButton(LabelMaker.labels().yes);
            var oButtonNo = this.makeLabelButton(LabelMaker.labels().no);

            oLabelControl.insertBefore(oButtonYes, null);
            oLabelControl.insertBefore(oButtonNo, null);

            var oButtonSave = this.makeSaveButton();

            document.body.insertBefore(oLabelControl, null);
            document.body.insertBefore(oButtonSave, null);

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

        }

        incrementPicture(iIncrement) {

            if (Math.abs(iIncrement) === 1) {
                if (this.decimal + iIncrement >= MIN_DECIMAL && this.decimal + iIncrement < MAX_DECIMAL) {
                    this.decimal = this.decimal + iIncrement;
                    this.navigationField.value = this.decimal;
                }
            }

            this.renderPicture();
            this.navigationField.setAttribute('value', this.decimal);

        }

        setLabel(iLabel) {

            var sLabel = iLabel === LabelMaker.labels().yes ? 'yes' : 'no';
            this.labellist[this.decimal] = sLabel;

        }

        saveLabels() {

            // saves labellist to file
            console.log(this.labellist);

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

    var oLabelMaker = new LabelMaker();

    oLabelMaker.renderMainView();
    oLabelMaker.renderPicture();

})
