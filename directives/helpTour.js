'use strict';

angular.module('myNetCMSApp')

.directive('myTour', ['HelpTour', function(HelpTour) {
    return {
        restrict: 'EA',
        scope: {
            /**
             *  Id to identify the file which will provide the config data.
             */
            id: '@',

            /**
             *  Element's selector ID that will trigger the tour starting.
             */
            sel: '@'
        },
        /**
         *  Directive's DOM manipulation function.
         */
        link: function($scope, element, attrs) {
            /**
             *  Help Tour initializaiton and event attaching.
             */
            HelpTour.init($scope.id, $scope.sel);
        }
    }
}]);
