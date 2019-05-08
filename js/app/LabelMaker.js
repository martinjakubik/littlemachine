/* global require */
requirejs(['Tools'], function (Tools) {

    'use strict';

    var LabelMaker = function () {
        
        makeMainView();
    };
    
    var makeMainView = function () {
        
        var oLabelMakerView = document.createElement('div');
        Tools.setClass(oLabelMakerView, 'labelmaker');
        oLabelMakerView.setAttribute('id', 'labelmaker');
    
        document.body.insertBefore(oLabelMakerView, null);
    
    };

    var oLabelMaker = new LabelMaker();

})
