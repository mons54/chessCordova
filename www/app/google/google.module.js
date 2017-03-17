/**
 * @ngdoc overview
 * @name google
 * @description 
 * Google module
 */
angular.module('google', []).

constant('googleClientId', '241448993510-5860ln6qoa9a1iov1t3j6uirsvhlerbb.apps.googleusercontent.com').

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
service('google', ['$rootScope', 'googleClientId', 'user', 'socket', 'translator',

    function ($rootScope, googleClientId, user, socket, translator) {

        var self = this;

        this.name = 'google';

        function setAuth (user) {

            var profile = user.getBasicProfile();

            self.auth = {
                accessToken: user.getAuthResponse().access_token,
                id: user.getId(),
                avatar: profile.Paa,
                name: profile.ig,
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

            googleplaygame.isSignedIn(function (response) {
                if (!response.isSignedIn) {
                    this.status = 'unknown';
                    delete this.auth;
                } else {
                    this.status = 'connected';
                }

                callback(this);
            });
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
                googleplaygame.auth(function (response) {
                    alert(response);
                    this.setLoginStatus(this.handleLogin);
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
            setAuth(gapi.auth2.getAuthInstance().currentUser.get());
            socket.connect();
        };

        return this;
    }
]);
