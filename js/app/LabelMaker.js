/* global require */
requirejs(['Tools'], function (Tools) {

    'use strict';

    var MAX_EXPONENT = 4096;
    var MAX_NUMBER_OF_BOXES = 65536;
    var BOX_SIZE = 5;

    var MIN_DECIMAL = 0;
    var MAX_DECIMAL = MAX_NUMBER_OF_BOXES;

    var PICTURE_CANVAS_WIDTH = BOX_SIZE;
    var PICTURE_CANVAS_HEIGHT = BOX_SIZE;
    var DRAW_BLOCK_SIZE = 48;

    var PICTURE_CANVAS_ID = 'picturecanvas';

    class LabelMaker {

        static oSides() {
            return {
                left: 0,
                right: 1
            }
        };

        
        constructor() {
            this.decimal = 0;
        }

        renderMainView() {

            this.renderPictureNavigator();

        }
        
        renderPictureNavigator() {
            
            var oPictureNavigator = document.createElement('div');
            oPictureNavigator.setAttribute('id', 'picturenavigator');
            Tools.setClass(oPictureNavigator, 'picturenavigator');

            var oButtonLeft = this.makeNavigationButton(LabelMaker.oSides().left);
            var oCanvas = this.makeCanvas();
            var oButtonRight = this.makeNavigationButton(LabelMaker.oSides().right);

            oPictureNavigator.insertBefore(oButtonLeft, null);
            oPictureNavigator.insertBefore(oCanvas, null);
            oPictureNavigator.insertBefore(oButtonRight, null);

            document.body.insertBefore(oPictureNavigator, null);

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

            var sSide = iSide === LabelMaker.oSides().left ? 'left' : 'right';
            var iIncrement = iSide === LabelMaker.oSides().left ? -1 : 1;

            var sButtonClass = `navigationbutton`;
            var sButtonId = `navigationbutton${sSide}`;
            Tools.setClass(oButton, sButtonClass);
            oButton.setAttribute('id', sButtonId);
            oButton.onclick = this.incrementPicture.bind(this, iIncrement);

            return oButton;

        }

        incrementPicture(iIncrement) {

            if (Math.abs(iIncrement) === 1) {
                if (this.decimal + iIncrement >= MIN_DECIMAL && this.decimal + iIncrement < MAX_DECIMAL) {
                    this.decimal = this.decimal + iIncrement;
                }
            }

            this.renderPicture();

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
