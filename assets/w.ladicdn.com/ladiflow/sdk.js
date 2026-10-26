"use strict";
(function () {
    const sdkUrl = 'https://w.ladicdn.com/ladiflow/ladiflow.min.js';
    var me = document.currentScript;
    var ver = new Date().getTime();
    var e = document.createElement('script');
    e.src = sdkUrl + '?ver=' + ver;
    e.onload = function () {
        var storeID = me.id;
        if (window.LadiFlow === undefined) {
            window.LadiFlow = new _LadiFlow();
        }
        window.LadiFlow.init({
            store_id: storeID,
            version: 'v1.0'
        })
    }
    e.async = true;
    document.getElementsByTagName('head')[0].appendChild(e);
}());