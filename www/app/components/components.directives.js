angular.module('components').

/**
 * @ngdoc directive
 * @name components.directive:button
 * @description 
 * Disable blur after clicking a button.
 * @restrict E
 */
directive('button', function () {
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
            element.on('click', function () {
                element.blur();
            });
        }
    };
}).

/**
 * @ngdoc directive
 * @name components.directive:showModal
 * @description 
 * Add a click event to an item to show a modal.
 * @requires components.service:modal
 * @restrict A
 * @param {string} showModal Id of modal
 */
directive('showModal', ['modal',
    function (modal) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.on('click', function (event) {
                    modal(attrs.showModal).show();
                });
            }
        };
    }
]).

/**
 * @ngdoc directive
 * @name components.directive:avatar
 * @description 
 * Load default avatar if error src.
 */
directive('avatar', function() {
    return {
        link: function(scope, element, attrs) {
            element.bind('error', function() {
                attrs.$set('src', 'images/default-avatar.png');
            });
        }
    };
}).

/**
 * @ngdoc directive
 * @name components.directive:modalSettings
 * @description 
 * Modal user settings.
 * @requires $rootScope
 * @requires $timeout
 * @requires global.service:socket
 * @requires global.service:user
 * @requires global.service:translator
 * @requires global.constant:languages
 * @requires game.constant:colorsGame
 * @restrict E
 * @scope
 */
directive('modalSettings', ['$rootScope', '$timeout', 'socket', 'user', 'translator', 'languages', 'colorsGame',
    function ($rootScope, $timeout, socket, user, translator, languages, colorsGame) {
        return {
            restrict: 'E',
            scope: true,
            replace: true,
            templateUrl: 'modal-settings.html',
            link: function (scope, element) {

                var defaultValues;

                $rootScope.$watchCollection('user', function(value, oldValue) {
                    if (value && value !== oldValue) {
                        setValues(value);
                    }
                });

                function setValues(value) {
                    scope.settings = {
                        edited: true,
                        lang: value.lang,
                        colorGame: value.colorGame,
                        sound: value.sound
                    };
                    scope.defaultValues = angular.copy(scope.settings);

                    var soundIsChecked = element.find('#settings-sound').is(':checked');

                    if (soundIsChecked !== value.sound) {
                        element.find('#settings-sound').click();
                    }
                }

                function done() {
                    delete scope.load;
                    scope.done = true;
                    $timeout(function () {
                        delete scope.done;
                    }, 1000);
                }

                scope.reset = function () {
                    setValues(scope.defaultValues);
                };

                function updateUser() {
                    var data = angular.copy(scope.settings);
                    data.edited = true;
                    scope.load = true;
                    socket.emit('updateUser', data, function (response) {

                        if (response.lang !== $rootScope.user.lang) {
                            translator.use(response.lang);
                        }

                        if (response.colorGame) {
                            user.setColorGame(response.colorGame);
                        }

                        user.setSound(response.sound);

                        angular.extend($rootScope.user, response);
                        setValues(response);
                        done();
                    });
                }

                scope.updateUser = function () {
                    if (angular.equals(scope.defaultValues, scope.settings)) {
                        done();
                        return;
                    }

                    updateUser();
                };

                scope.languages = languages;

                scope.colorsGame = colorsGame;
            }
        };
    }
]).

/**
 * @ngdoc directive
 * @name components.directive:modalCreateGame
 * @description 
 * Modal create game.
 * @requires $rootScope
 * @requires $route
 * @requires components.service:modal
 * @requires global.service:socket
 * @requires game.constant:paramsGame
 * @restrict E
 * @scope
 */
directive('modalCreateGame', ['$rootScope', '$route', 'modal', 'socket', 'paramsGame', 

    function ($rootScope, $route, modal, socket, paramsGame) {
        return {
            restrict: 'E',
            scope: true,
            replace: true,
            templateUrl: 'modal-create-game.html',
            link: function (scope, element) {

                var pointsMin = paramsGame.pointsMin,
                    pointsMax = paramsGame.pointsMax,
                    value;

                paramsGame.pointsMin = [];
                paramsGame.pointsMax = [];

                scope.paramsGame = paramsGame;

                $rootScope.$watchCollection('dataGame', function (value) {
                    if (!value) {
                        return;
                    }

                    if (paramsGame.pointsMin.indexOf(value.pointsMin) === -1) {
                        value.pointsMin = null;
                    }

                    if (paramsGame.pointsMax.indexOf(value.pointsMax) === -1) {
                        value.pointsMax = null;
                    }

                    scope.game = value;
                });

                scope.$watch('game.pointsMin', function (value) {
                    paramsGame.pointsMax = [];
                    for (var i = pointsMin + 100; i <= pointsMax; i += 100) {
                        if (!value || value < i) {
                            paramsGame.pointsMax.push(i);
                        }
                    }
                });

                scope.$watch('game.pointsMax', function (value) {
                    paramsGame.pointsMin = [];
                    for (var i = pointsMin; i < pointsMax; i += 100) {
                        if (!value || value > i) {
                            paramsGame.pointsMin.push(i);
                        }
                    }
                });

                scope.createGame = function () {
                    socket.emit('createGame', scope.game);
                    if ($route.current.name === 'home') {
                        modal(element).hide();
                    } else {
                        scope.loadGame = true;
                    }
                };

                scope.getColorClass = function (color) {
                    if (!color) {
                        return;
                    }
                    return color === 'white' ? 'app-search__game-color--white' : 'app-search__game-color--black';
                };

                scope.stopLoad = stopLoad;

                element.on('hide', stopLoad);

                function stopLoad () {
                    if (scope.loadGame) {
                        socket.emit('removeGame');
                        delete scope.loadGame;
                    }
                }
            }
        };
    }
]).

/**
 * @ngdoc directive
 * @name components.directive:gameChoices
 * @description 
 * Type games choices
 * @restrict E
 * @scope
 */
directive('gameChoices', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            data: '=',
            model: '='
        },
        templateUrl: 'app/components/templates/games-choices.html'
    };
}).

/**
 * @ngdoc directive
 * @name components.directive:modalChallenges
 * @description 
 * Modal challenges
 * @requires $rootScope
 * @requires global.service:socket
 * @requires components.service:modal
 * @restrict E
 * @scope
 */
directive('modalChallenges', ['$rootScope', 'socket', 'modal', 'orderByFilter',
    function ($rootScope, socket, modal, orderByFilter) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'modal-challenges.html',
            link: function (scope, element) {

                scope.orderByFilter = {
                    challenges: {
                        expression: ['points', 'time', 'color', 'name'],
                        reverse: true
                    }
                };

                $rootScope.challenges = [];

                scope.removeChallenge = function (uid) {
                    socket.emit('removeChallenge', uid);
                };

                scope.startChallenge = function (uid) {
                    socket.emit('startChallenge', uid);
                };

                socket.on('challenges', function (data) {
                    $rootScope.challenges = orderByFilter(data, scope.orderByFilter.challenges.expression, scope.orderByFilter.challenges.reverse);
                    if (!data.length) {
                        modal(element).hide();
                    }
                });
            }
        };
    }
]).

/**
 * @ngdoc directive
 * @name components.directive:sortable
 * @description 
 * Use this directive to make a sortable column
 * @requires $rootScope
 * @requires orderByFilter
 * @restrict A
 * @param {array} expression The sort order. Example: ['points', 'time', 'color']
 * @param {array} collection The list that sort
 * @param {string} icon The icon to display for this column
 */
directive('sortable', ['$rootScope', 'orderByFilter',
    function ($rootScope, orderByFilter) {
        return {
            restrict: 'A',
            scope: {
                expression: '='
            },
            templateUrl: 'app/components/templates/sortable.html',
            link: function (scope, element, attrs) {
                var collection = scope.$parent[attrs.collection];
                scope.icon = attrs.icon;
                scope.sort = function () {
                    if (!scope.$parent[attrs.collection]) {
                        return;
                    }
                    scope.reverse = !scope.reverse;
                    scope.$parent.orderByFilter[attrs.collection] = {
                        expression: scope.expression,
                        reverse: scope.reverse
                    };
                    scope.$parent[attrs.collection] = orderByFilter(scope.$parent[attrs.collection], scope.expression, scope.reverse);
                };
            }
        };
    }
]).

/**
 * @ngdoc directive
 * @name components.directive:elementToggle
 * @description 
 * Use this directive to make a toggle element
 * @requires $rootScope
 * @requires orderByFilter
 * @restrict E
 */
directive('elementToggle', [function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            name: '=',
            collection: '=',
            hide: '='
        },
        templateUrl: 'app/components/templates/element-toggle.html',
        link: function (scope, element, attrs) {

            if (scope.hide) {
                toggle();
            }

            scope.toggle = toggle;

            function toggle() {
                scope.close = !scope.close;
                element.parents('[element]').find('[element-content]').toggle();
            }
        }
    };
}]).

/**
 * @ngdoc directive
 * @name components.directive:pagination
 * @description 
 * Pagination
 * @requires $rootScope
 * @restrict A
 * @scope
 */
directive('pagination', ['$rootScope', function ($rootScope) {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'app/components/templates/pagination.html',
        link: function (scope, element) {

            scope.setPage = function (page) {
                page = parseInt(page);
                if (!page || page < 0 || page === $rootScope.pages.page || page > $rootScope.pages.last) {
                    $rootScope.page = $rootScope.pages.page;
                    return;
                }
                $rootScope.page = page;
                $rootScope.$emit('page', page);
            };

            $rootScope.$watch('page', function (value) {
                if (!value) {
                    return;
                }
                element.find('[ng-model="page"]').val(value);
            });
        }
    };
}]).

/**
 * @ngdoc directive
 * @name components.directive:share
 * @description 
 * Share
 * @requires $window
 * @requires $filter
 * @requires global.constant:host
 * @requires facebook.constant:facebookAppId
 * @requires google.constant:googleClientId
 * @restrict A
 * @scope
 */
directive('share', ['$window', '$filter', 'host', 'facebookAppId', 'googleClientId',
    function ($window, $filter, host, facebookAppId, googleClientId) {
        return {
            restrict: 'A',
            scope: {
                share: '=',
            },
            templateUrl: 'app/components/templates/share.html',
            link: function(scope, element) {

                scope.$watchCollection('share', function (value) {

                    if (value) {

                        if (!value.link) {
                            value.link = '/';
                        }

                        if (!value.picture) {
                            value.picture = '/logo-mini.png';
                        }

                        if (!value.name) {
                            value.name = $filter('translate')('title');
                        }

                        if (!value.description) {
                            value.description = $filter('translate')('description');
                        }

                        if (!value.caption) {
                            value.caption = $filter('translate')('title');
                        }

                        scope.link = host + value.link;
                        scope.picture = host + '/images' + value.picture;
                        scope.title = value.title;
                        scope.description = value.description;
                        scope.caption = value.caption;
                    }
                });

                scope.facebook = function () {
                    facebookConnectPlugin.showDialog({
                        method: 'share',
                        href: scope.link,
                        hashtag: '#chess'
                    });
                };
            }
        };
    }
]);
