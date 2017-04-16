/**
 * @ngdoc overview
 * @name google
 * @description 
 * Google module
 */
angular.module('google', []).

constant('googleClientId', '241448993510-5860ln6qoa9a1iov1t3j6uirsvhlerbb.apps.googleusercontent.com').
constant('iOSApiKey', '241448993510-tpm610r2sqc7b4242al3tnhibltve3kj.apps.googleusercontent.com').

/**
 * @ngdoc service
 * @name google.service:google
 * @description 
 * Google service.
 * @requires $rootScope
 * @requires global.service:user
 * @requires global.service:socket
 * @requires global.service:translator
 */
service('google', ['$rootScope', 'googleClientId', 'iOSApiKey', 'user', 'socket', 'translator',

    function ($rootScope, googleClientId, iOSApiKey, user, socket, translator) {

        var self = this;

        this.name = 'google';

        function setAuth (data) {
            self.auth = {
                accessToken: data.idToken,
                id: data.userId,
                avatar: data.imageUrl,
                name: data.displayName,
                lang: translator.navigator
            };
        }

        /**
         * @ngdoc function
         * @name #setLoginStatus
         * @methodOf google.service:google
         * @description
         * Set Google login status.
         * @param {function} callback Callback
         */
        this.setLoginStatus = function (callback) {

            if (this.status === 'error') {
                callback();
                return;
            }

            window.plugins.googleplus.trySilentLogin({
                webClientId: googleClientId,
                iOSApiKey: iOSApiKey,
                scope: 'profile'
            }, function (response) {
                this.status = 'connected';
                setAuth(response);
                callback(this);
            }.bind(this), function (error) {
                this.status = 'unknown';
                callback(this);
            }.bind(this));
        };

        /**
         * @ngdoc function
         * @name #login
         * @methodOf google.service:google
         * @description
         * Google login.
         */
        this.login = function () {
            if (this.status === 'connected') {
                this.handleLogin();
            } else {
                window.plugins.googleplus.login({
                    webClientId: googleClientId,
                    iOSApiKey: iOSApiKey,
                    scope: 'profile'
                }, function (response) {
                    this.status = 'connected';
                    setAuth(response);
                    this.handleLogin();
                }.bind(this));
            }
        };

        /**
         * @ngdoc function
         * @name #handleLogin
         * @methodOf google.service:google
         * @description
         * Set user data from google.
         */
        this.handleLogin = function () {
            user.setLogin(self.name);
            socket.connect();
        };

        return this;
    }
]);
