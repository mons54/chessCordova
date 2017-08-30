/**
 * @ngdoc overview
 * @name game
 * @description 
 * Game Module
 */
angular.module('game', []).

/**
 * @ngdoc parameters
 * @name game.constant:paramsGame
 * @description
 * The params games data
 */
constant('paramsGame', chess.game.options).

/**
 * @ngdoc parameters
 * @name game.constant:colorsGame
 * @description
 * List of colors name for game
 */
constant('colorsGame', ['default', 'green', 'pink', 'grey', 'brown', 'black', 'orange', 'blue']);
