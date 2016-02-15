 'use strict';

 angular.module('super')
     .directive('menuLink', function() {
         return {
             scope: {
                 section: '=',
                 building: '=building'
             },
             templateUrl: 'client/menu/views/menu-link.ng.html',
             link: function($scope, $element) {
                 var controller = $element.parent().controller();
                 $scope.focusSection = function() {
                     // set flag to be used later when
                     // $locationChangeSuccess calls openPage()
                     controller.autoFocusContent = true;
                 };
             }
         };
     });
     
 angular.module('super').filter('unique', function() {
    return function (arr, field) {
        return _.uniq(arr, function(a) { return a[field]; });
    };
});
 angular.module('super')
     .directive('loading', function() {
         return {
             scope: {
                 count: '='
             },
             templateUrl: 'client/loading.ng.html',
             link: function($scope, $element) {}
         };
     });

 angular.module('super')
     .directive('menuToggle', ['$timeout', function($timeout) {
         return {
             scope: {
                 section: '='
             },
             templateUrl: 'client/menu/views/menu-toggle.ng.html',
             link: function($scope, $element) {
                 var controller = $element.parent().controller();

                 $scope.isOpen = function() {
                     return controller.isOpen($scope.section);
                 };
                 $scope.toggle = function() {
                     controller.toggleOpen($scope.section);
                 };
             }
         };
     }]);
     
angular.module('super').directive("flipper", function() {
	return {
		restrict: "E",
		template: "<div class='flipper' ng-transclude ng-class='{ flipped: flipped }'></div>",
		transclude: true,
		scope: {
			flipped: "="
		}
	};
});

angular.module('super').directive("front", function() {
	return {
		restrict: "E",
		template: "<div class='front tile' ng-transclude></div>",
		transclude: true
	};
});

angular.module('super').directive("back", function() {
	return {
		restrict: "E",
		template: "<div class='back tile' ng-transclude></div>",
		transclude: true
	}
});