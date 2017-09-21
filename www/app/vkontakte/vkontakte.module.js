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

        function getLanguage(language) {
            switch (language) {
                case '98':
                    return 'ar';
                case '6':
                    return 'de';
                case '3':
                    return 'en';
                case '4':
                    return 'es';
                case '16':
                    return 'fr';
                case '7':
                    return 'it';
                case '20':
                    return 'ja';
                case '61':
                    return 'nl';
                case '12':
                case '73':
                    return 'pt';
                case '82':
                    return 'tr';
                case '18':
                    return 'zh';
                default:
                    return 'ru';
            };
        }

        function setLoginStatus (response) {

            self.status = 'connected';

            response = JSON.parse(response);

            self.auth = {
                accessToken: response.token,
                user: {
                    name: response.user.nickname || (response.user.first_name + ' ' + response.user.last_name),
                    picture: response.user.photo,
                    lang: getLanguage(response.user.language)
                }
            };

            alert(JSON.stringify(self.auth));
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
            SocialVk.init(vkontakteAppId, this.login);
        };

        /**
         * @ngdoc function
         * @name #login
         * @methodOf vkontakte.service:vkontakte
         * @description
         * Facebook login.
         */
        this.login = function () {
            if (this.status === 'connected') {
                this.handleLogin();
            } else {
                SocialVk.login([], function (response) {
                    setLoginStatus(response);
                    this.handleLogin();
                }.bind(this));
            }
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
