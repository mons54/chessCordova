angular.module('trophies').

/**
 * @ngdoc controller
 * @name trophies.controller:trophiesCtrl
 * @description 
 * The trophies controller.
 * @requires $rootScope
 * @requires $scope
 */
controller('trophiesCtrl', ['$rootScope', '$scope', '$timeout', 'socket',
    
    function ($rootScope, $scope, $timeout, socket) {

        $scope.openTrophy = function (trophy) {
            
            var trophies = {};

            trophies[trophy.id] = trophy.value;

            $rootScope.$emit('trophies', {
                share: true,
                trophies: trophies
            });
        };

        var userTrophies = $rootScope.user.trophies || {};

        $scope.trophies = [];
        for (var i = 1; i <= 25; i++) {
            $scope.trophies.push({
                id: i,
                value: userTrophies[i] || 0
            });

        }
    }
]);
