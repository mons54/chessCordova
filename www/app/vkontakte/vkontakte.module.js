/**
 * @ngdoc overview
 * @name vkontakte
 * @description 
 * Facebook module
 */
angular.module('vkontakte', []).

/**
 * @ngdoc parameters
 * @name vkontakte.constant:vkontakteAppId
 * @description
 * The redirect uri.
 */
constant('vkontakteAppId', '6170101').

/**
 * @ngdoc service
 * @name vkontakte.service:vkontakte
 * @description 
 * Facebook service.
 * @requires $rootScope
 * @requires global.service:user
 * @requires global.service:socket
 */
service('vkontakte', ['$rootScope', 'user', 'socket', 'vkontakteAppId',

    function ($rootScope, user, socket, vkontakteAppId) {

        var self = this;

        this.name = 'vkontakte';

        function setLoginStatus (response) {
            
        }

        /**
         * @ngdoc function
         * @name #setLoginStatus
         * @methodOf vkontakte.service:vkontakte
         * @description
         * Set Facebook login status.
         * @param {function} callback Callback
         */
        this.setLoginStatus = function (callback) {
            VK.init(function() {
                alert('init');
            }, function() {
                alert('error');
            }, '5.60'); 
        };

        /**
         * @ngdoc function
         * @name #login
         * @methodOf vkontakte.service:vkontakte
         * @description
         * Facebook login.
         */
        this.login = function () {
            
        };

        /**
         * @ngdoc function
         * @name #handleLogin
         * @methodOf vkontakte.service:vkontakte
         * @description
         * Set user data from vkontakte.
         * Set user friends from vkontakte list.
         */
        this.handleLogin = function () {

            user.setLogin(this.name);
            
            socket.connect();
        };

        return this;
    }
]);
