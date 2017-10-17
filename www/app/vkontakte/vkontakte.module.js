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
constant('vkontakteAppId', 6170421).

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

            user.set('vkontakte', response);

            var responseUser = response.user[0];

            self.auth = {
                accessToken: response.token,
                mobile: true,
                user: {
                    name: responseUser.nickname || (responseUser.first_name + ' ' + responseUser.last_name),
                    picture: responseUser.photo,
                    lang: getLanguage(responseUser.language)
                }
            };
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
            SocialVk.init(vkontakteAppId, function () {
                var response = user.get('vkontakte');
                if (response) {
                    setLoginStatus(response);
                    callback(self);
                }
            });
        };

        /**
         * @ngdoc function
         * @name #login
         * @methodOf vkontakte.service:vkontakte
         * @description
         * Facebook login.
         */
        this.login = function () {
            if (self.status === 'connected') {
                self.handleLogin();
            } else {
                SocialVk.login([], function (response) {
                    response = self.getResponse(response);
                    setLoginStatus(response);
                    self.handleLogin();
                });
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

            user.setLogin(self.name);
            
            socket.connect();
        };

        this.getFriendsList = function (success, error) {
            return SocialVk.callApiMethod('apps.getFriendsList', {
                count: 100,
                fields: 'photo_50',
                extended: true
            }, function (response) {
                success(self.getResponse(response));
            }, error);
        };

        this.inviteFriend = function (uid, success, error) {
            return SocialVk.callApiMethod('apps.sendRequest', {
                user_id: uid,
                type: 'invite'
            }, success, error);
        };

        this.getResponse = function (response) {
            try { 
                return JSON.parse(response); 
            } catch (Error) {
                return response;
            }
        };

        return this;
    }
]).

directive('modalVkontakteInvite', ['$rootScope', 'modal', 'vkontakte',
    function ($rootScope, modal, vkontakte) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                friends: null
            },
            templateUrl: 'modal-vkontakte-invite.html',
            link: function (scope, element) {

                $rootScope.$on('vkontakteInviteFriends', function (event, data) {
                    if (!scope.friends) {
                        vkontakte.getFriendsList(function (response) {
                            scope.friends = response.items;
                            modal(element).show();
                        });
                    } else {
                        modal(element).show();
                    }
                });

                scope.invite = function (friend) {
                    vkontakte.inviteFriend(friend.id, function () {
                        friend.disabled = true;
                    })
                };
            }
        };
    }
]);
