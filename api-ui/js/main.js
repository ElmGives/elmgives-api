require.config({
    paths: {
        // Major libraries
        jquery: 'libs/jquery/jquery-min',
        underscore: 'libs/underscore/underscore-min', // https://github.com/amdjs
        lodash: 'libs/lodash/lodash', // alternative to underscore
        backbone: 'libs/backbone/backbone-min', // https://github.com/amdjs
        jsoneditor: 'libs/jsoneditor/jquery-jsoneditor',
        text: 'libs/require/text',
        // Just a short cut so we can put our html outside the js dir
        // When you have HTML/CSS designers this aids in keeping them out of
        // the js directory
        templates: '../templates'
    }
});

require([
    'views/app',
    'router',
    'vm',
], function(AppView, Router, Vm) {
    'use strict';
    var appView = Vm.create({}, 'AppView', AppView);
    appView.render();

    // The router now has a copy of all main appview
    Router.initialize({
        appView: appView
    });
});
