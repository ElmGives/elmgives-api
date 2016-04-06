'use strict';

require.config({
    paths: {
        jquery: 'jquery-min',
        underscore: 'underscore-min',
        backbone: 'backbone-min',
        jsoneditor: 'jquery-jsoneditor',
        text: 'text'
    }
});

define([
    'jquery',
    'underscore',
    'backbone',
    'config',
    'jsoneditor',
    'text!../templates/layout.html',
    'text!../templates/menu.html',
    'text!../templates/page.html',
    'text!../templates/info.html'
], function($, _, Backbone, config, jsonEditor, layout, header, home, service) {
    var events = _.extend({}, Backbone.Events);
    var views = {};

    var vm = function(context, name, View, options) {

        if (typeof views[name] !== 'undefined') {
            views[name].undelegateEvents();
            if (typeof views[name].clean === 'function') {
                views[name].clean();
            }
        }

        var view = new View(options);
        views[name] = view;

        if (typeof context.children === 'undefined') {
            context.children = {};
        }

        context.children[name] = view;
        events.trigger('viewCreated');
        return view;
    };

    var AppView = Backbone.View.extend({
        el: '.container-fluid',
        render: function() {
            $(this.el).html(layout);
            vm(this, 'HeaderMenuView', HeaderMenuView).render();
        }
    });

    var HeaderMenuView = Backbone.View.extend({
        el: '.main-menu-container',

        events: {
            'click .treeview': 'highlightMenuItem',
            'click .scroll-button': 'scrollToCall'
        },

        render: function() {

            var menuRendered = _.template(header, {
                services: config.services
            }, {});

            $(this.el).html(menuRendered);

            $('a[href="' + window.location.hash + '"]').addClass('active');
        },

        highlightMenuItem: function(ev) {
            if (!$(ev.currentTarget).hasClass('active')) {
                window.location.hash = ev.toElement.hash;
            }

            $('.active').removeClass('active');
            $(ev.currentTarget).addClass('active');
        },

        scrollToCall: function(event) {

            event.preventDefault();
            var callName = $(event.target).attr('call');

            $('html, body').animate({
                scrollTop: ($('#header' + callName).offset().top - 35)
            }, 1000);
        }
    });

    var HomePage = Backbone.View.extend({
        el: '.page',
        render: function() {
            $(this.el).html(home);
        }
    });

    var servicePage = Backbone.View.extend({
        el: '.page',
        image: null,
        events: {
            'click .make-call': 'makeCall'
        },

        render: function(serviceName) {
            this.service = config.services[serviceName];

            var page = _.template(service, {
                service: config.services[serviceName]
            }, {});

            $(this.el).html(page);

            $('.file-input').on('change', _.bind(this.getImage, this));
        },

        getImage: function(e) {
            var input = document.getElementById($(e.target).attr('id'));
            this.image = input.files[0];
        },

        makeCall: function(event) {

            event.preventDefault();

            var callName = $(event.target).attr('call');
            var call = this.service.calls[callName];
            var data = {};
            var callNameId = callName.replace(/ /g, '');
            var url = call.url;

            if (call.wrapper) {
                data[call.wrapper] = {};
            }

            if (call.nestedAttributes) {
                data[call.wrapper][call.nestedAttributes] = {};
            }

            var formData;

            if (call.hasFile) {
                formData = new FormData();
                var self = this;

                _.each(call.params, function(paramType, paramName) {

                    if (_.isObject(paramType)) {
                        _.each(paramType, function(paramNestedType, paramNestedName) {
                            if (paramNestedType === 'file') {
                                formData.append(call.wrapper + '[' + call.nestedAttributes + '][image]', self.image);
                            } else {
                                var paramInputId = '#input' + callNameId + paramNestedName,
                                    inputObject = $(paramInputId);
                                formData.append(call.wrapper + '[' + call.nestedAttributes + '][' + paramNestedName + ']', inputObject.val());
                            }
                        });
                    } else {
                        if (paramType === 'file') {
                            formData.append(call.wrapper + '[image]', self.image);
                        } else {
                            var paramInputId = '#input' + callNameId + paramName,
                                inputObject = $(paramInputId);
                            formData.append(call.wrapper + '[' + paramName + ']', inputObject.val());
                        }
                    }
                });
            } else {
                _.each(call.params, function(paramType, paramName) {
                    var paramInputId = '#input' + callNameId + paramName;
                    var inputObject = $(paramInputId);

                    if ($.trim(inputObject.val()) === '') {
                        return;
                    }

                    if (call.wrapper) {
                        if (_.isObject(paramType)) {
                            _.each(paramType, function(paramNestedType, paramNestedName) {
                                var paramInputId = '#input' + callNameId + paramNestedName;
                                var inputObject = $(paramInputId);

                                if ($.trim(inputObject.val()) !== '') {
                                    data[call.wrapper][call.nestedAttributes][paramNestedName] = inputObject.val();
                                }
                            });
                        } else {
                            data[call.wrapper][paramName] = inputObject.val();
                        }
                    } else {
                        data[paramName] = inputObject.val();
                    }
                });
            }

            var paramInputId;

            if (typeof(call.urlWithId) !== 'undefined' && call.urlWithId) {

                if (_.isArray(call.urlWithId)) {
                    _.each(call.urlWithId, function(urlId) {
                        paramInputId = '#input' + callNameId + urlId;
                        var inputObject = $(paramInputId);
                        url = url.replace('[' + urlId + ']', inputObject.val());
                    });
                } else {
                    paramInputId = '#input' + callNameId + call.urlWithId;
                    var inputObject = $(paramInputId);
                    url = url.replace('[' + call.urlWithId + ']', inputObject.val());
                }
            }

            var result = $('#result' + callNameId);

            result.empty().html('<span class="label label-info">Loading</span>');

            paramInputId = '#input' + callNameId + 'auth_token';

            var cu = localStorage.getItem('cu');
            var token = $(paramInputId).val() || JSON.parse((cu || '{}')).token;

            function beforeSend(xhr) {
                if (token) {
                    xhr.setRequestHeader('Authorization', token);
                }
            }

            function success(response, status, xhr) {
                var data = {
                    status: xhr.status,
                    readyState: xhr.readyState,
                    response: response
                };

                result.empty().jsonEditor(data);
                call.callback && call.callback(response);
            }

            function fail(request, status, error) {
                result.empty().jsonEditor({
                    status: request.status,
                    error: error,
                    message: request.responseJSON || request
                });
            }

            var settings = {
                url: url,
                type: call.method,
                data: data,
                beforeSend: beforeSend,
                success: success,
                error: fail
            };

            if (call.hasFile) {
                settings.processData = false;
                settings.contentType = false;
                settings.data = formData;
            }

            $.ajax(settings);
        }
    });

    var AppRouter = Backbone.Router.extend({
        routes: {
            '': 'home',
            'service/:name': 'service',
            '*actions': 'home'
        }
    });

    var router = function(options) {
        new AppRouter(options)
            .on('route:home', function() {
                vm(options.appView, 'HomePage', HomePage).render();
            })
            .on('route:service', function(serviceName) {
                vm(options.appView, 'WSInfo', servicePage).render(serviceName);
            });

        Backbone.history.start();
    };

    var appView = vm({}, 'AppView', AppView);
    appView.render();

    router({
        appView: appView
    });
});
