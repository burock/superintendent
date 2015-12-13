angular.module("super").controller("FlatDetailsCtrl", ['$scope',
    '$meteor', '$rootScope', '$state', '$stateParams', '$mdDialog', '$translate',
    function($scope, $meteor, $rootScope, $state, $stateParams, $mdDialog, $translate) {

        $scope.$on('flatEvent', function(event, flatId) {
            $scope.flat = $meteor.object(Flats, flatId, false);
        });

        $scope.deleteFlat = function(flat) {
            $rootScope.confirmDelete($translate.instant("FLAT"), $scope.flat.no).then(
                function(data) {
                    if (data) $scope.flats.remove(flat);
                });
        };

        $scope.saveFlat = function() {
            $scope.flat.save();
            $rootScope.showSimpleToast(this, $translate.instant('SAVED'));
            /*.then(function(nofDocs) {
            }, function(error) {
                console.log("flat save error", error);
            });*/
        };

        $scope.resetFlat = function() {
            $scope.flat.reset();
        };

    }
]).directive('flatdetails', function() {
    return {
        restrict: 'E',
        templateUrl: 'client/flats/views/flat-details.ng.html',
        controller: 'FlatDetailsCtrl',
        link: function($scope, element, attrs) {
            element.on('click', function() {
                //element.html('You clicked me!');
            });
            element.on('mouseenter', function() {
                //element.css('background-color', 'yellow');
            });
            element.on('mouseleave', function() {
                //element.css('background-color', 'white');
            });
        }
    };
});