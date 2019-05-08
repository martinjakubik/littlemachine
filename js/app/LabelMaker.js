/* global require */
requirejs(['Tools'], function (Tools) {

    'use strict';

    var LabelMaker = function () {
        makeMainView();
        var sBinary = '111111000';
        addPicture(sBinary);
    };
    
    var makeMainView = function () {
        
        var oLabelMakerView = document.createElement('div');
        Tools.setClass(oLabelMakerView, 'labelmaker');
        oLabelMakerView.setAttribute('id', 'labelmaker');
    
        document.body.insertBefore(oLabelMakerView, null);
    
    };

    var addPicture = function (sBinary) {
        
        var sFileName = `../boxes9/${sBinary}.png`;
        var oImg = document.createElement('img');
        Tools.setClass(oImg, 'png');
        oImg.setAttribute('id', 'png');
        oImg.setAttribute('src', sFileName);
    
        var oLabelMakerView = document.getElementById('labelmaker');

        oLabelMakerView.insertBefore(oImg, null);
    
    };

    var oLabelMaker = new LabelMaker();

})
