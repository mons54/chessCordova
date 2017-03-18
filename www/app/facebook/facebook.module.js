/**
 * @ngdoc overview
 * @name facebook
 * @description 
 * Facebook module
 */
angular.module('facebook', []).

/**
 * @ngdoc parameters
 * @name facebook.constant:facebookAppId
 * @description
 * The redirect uri.
 */
constant('facebookAppId', '1687859708170830').

/**
 * @ngdoc service
 * @name facebook.service:facebook
 * @description 
 * Facebook service.
 * @requires $rootScope
 * @requires global.service:user
 * @requires global.service:socket
 */
service('facebook', ['$rootScope', 'user', 'socket', 'facebookAppId',

    function ($rootScope, user, socket, facebookAppId) {

        var self = this;

        this.name = 'facebook';

        function setLoginStatus (response) {
            self.status = response.status;
            if (response.status === 'connected') {
                self.auth = {
                    id: response.authResponse.userID,
                    accessToken: response.authResponse.accessToken
                };
            } else {
                delete self.auth;
            }
        }

        /**
         * @ngdoc function
         * @name #setLoginStatus
         * @methodOf facebook.service:facebook
         * @description
         * Set Facebook login status.
         * @param {function} callback Callback
         */
        this.setLoginStatus = function (callback) {
            facebookConnectPlugin.getLoginStatus(function (response) {
                setLoginStatus(response);
                callback(this);
            }.bind(this));
        };

        /**
         * @ngdoc function
         * @name #login
         * @methodOf facebook.service:facebook
         * @description
         * Facebook login.
         */
        this.login = function () {
            if (this.status === 'connected') {
                this.handleLogin();
            } else {
                facebookConnectPlugin.login(['user_friends'], function (response) {
                    alert(response);
                    setLoginStatus(response);
                    self.handleLogin();
                });
            }
        };

        /**
         * @ngdoc function
         * @name #handleLogin
         * @methodOf facebook.service:facebook
         * @description
         * Set user data from facebook.
         * Set user friends from facebook list.
         */
        this.handleLogin = function () {

            user.setLogin(this.name);
            
            socket.connect();

            if ($rootScope.user.friends.length) {
                return;
            }
                        
            $rootScope.user.friends.push(this.auth.id);

            facebookConnectPlugin.api('/me/friends?fields=installed,id,name', function (res) {
                angular.forEach(res.data, function (value) {
                    if (value.installed) {
                        $rootScope.user.friends.push(value.id);
                    }
                });
            });
        };

        return this;
    }
]);
