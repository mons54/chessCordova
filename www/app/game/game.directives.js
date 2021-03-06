angular.module('game').

/**
 * @ngdoc directive
 * @name game.directive:profileGame
 * @description 
 * Shows the profile of a player.
 * @restrict A
 * @scope
 * @param {object} player Object with the data of the player.
 */
directive('playerProfileGame', function (utils) {
    return {
        restrict: 'A',
        scope: { 
            player: '='
        },
        replace: true,
        templateUrl: 'app/game/templates/profile-game.html',
        controller: 'profileGameCtrl'
    };
}).

/**
 * @ngdoc directive
 * @name game.directive:pieceDraggable
 * @description 
 * Makes a piece draggable piece.
 * @restrict A
 * @scope
 * @param {string} position The position of the piece.
 */
directive('pieceDraggable', ['socket', 'modal', function (socket, modal) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {

            var selectedClass = 'is-touch',
                droppableClass =  'ui-droppable',
                modalPromotion = modal('#modal-promotion');

            scope.$watch('game', function (game) {

                if (game.finish) {
                    element.unbind('click').closest('[data-game-box]').removeClass(selectedClass);
                    $('.' + droppableClass).removeClass(droppableClass);
                    return;
                }

                var piece = game.pieces[attr.position];

                if (!piece || 
                    !scope.isPlayerTurn() || 
                    piece.color !== game.turn || 
                    (!piece.deplace.length && !piece.capture.length)) {
                    return;
                }

                element.click(function () {
                    var isOpen = $(this).data('open');
                    stopClickable($('[piece-draggable]'));
                    $('.' + droppableClass).removeClass(droppableClass).unbind('click');
                    if (isOpen) {
                        stopClickable($(this));
                        $('.' + droppableClass).removeClass(droppableClass).unbind('click');
                    } else {
                        $(this).data('open', true).closest('[data-game-box]').addClass(selectedClass);
                        angular.forEach(piece.deplace.concat(piece.capture), function (position) {
                            $('#' + position).addClass(droppableClass).click(function () {
                                stopClickable(element);
                                $('.' + droppableClass).removeClass(droppableClass).unbind('click');
                                if (piece.name === 'pawn' && (position.substr(-1) === '1' || position.substr(-1) === '8')) {
                                    modalPromotion.show();
                                    modalPromotion.find('[data-icon]').click(function() {
                                        var promotion = $(this).data('icon');
                                        modalPromotion.find('[data-icon]').unbind('click');
                                        sendMove(position, promotion);
                                    });
                                } else {
                                    sendMove(position);
                                }

                                $('[piece-draggable]').unbind('click'); 
                            });
                        });
                    }
                });

                function stopClickable (element) {
                    element.data('open', false).closest('[data-game-box]').removeClass(selectedClass);
                }

                function sendMove(position, promotion) {
                    socket.emit('moveGame', {
                        id: game.id,
                        start: attr.position,
                        end: position,
                        promotion: promotion
                    });
                }
            });
        }
    };
}]).

/**
 * @ngdoc directive
 * @name components.directive:scrollGame
 * @description 
 * Scroll Game
 * @restrict A
 * @scope
 */
directive('scrollGame', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {

            var isScroll = true,
                direction = attrs.scrollGameDirection,
                el = element[0];

            element.on('scroll', function () {
                if (direction === 'left') {
                    isScroll = (el.scrollLeft + el.clientWidth + 1) > el.scrollWidth;
                } else {
                    isScroll = (el.scrollTop + el.clientHeight + 1) > el.scrollHeight;
                }
            });

            scope.$watchCollection(attrs.scrollGame, function (newValue) {
                if (newValue && isScroll) {
                    $timeout(function() {
                        if (direction === 'left') {
                            element.scrollLeft(el.scrollWidth);
                        } else {
                            element.scrollTop(el.scrollHeight);
                        }
                    });
                }
            });

            if (attrs.scrollGameActive) {
                scope.$watch(attrs.scrollGameActive, function (newValue) {
                    if (!scope.game || !scope.game.finish || typeof newValue === 'undefined') {
                        return;
                    }

                    $timeout(function() {

                        var active = element.find('[data-scroll-game-active="' + newValue + '"]'),
                            offset;

                        if (!active.length) {
                            return;
                        }

                        if (typeof attrs.scrollGameActiveParent !== 'undefined') {
                            active = active.parent();
                        }

                        if (direction === 'left') {

                            offset = active.position().left;

                            var left = element.scrollLeft(),
                                right = element.scrollLeft() + element.width(),
                                width = active.outerWidth();

                            if (offset < left) {
                                element.scrollLeft(offset);
                            } else if (offset + width >= right) {
                                element.scrollLeft(offset + width - element.width());
                            }
                        } else {

                            offset = active.position().top;

                            var top = element.scrollTop(),
                                bottom = element.scrollTop() + element.height(),
                                height = active.outerHeight();

                            if (offset < top) {
                                element.scrollTop(offset);
                            } else if (offset + height >= bottom) {
                                element.scrollTop(offset + height - element.height());
                            }
                        }
                    });
                });
            }

            if (attrs.scrollGameShow) {
                scope.$watch(attrs.scrollGameShow, function (newValue) {
                    if (newValue && isScroll) {
                        $timeout(function() {
                            if (direction === 'left') {
                                element.scrollLeft(el.scrollWidth);
                            } else {
                                element.scrollTop(el.scrollHeight);
                            }
                        });
                    }
                });
            }
        }
    };
}]);
