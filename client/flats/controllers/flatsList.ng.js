angular.module("super").controller("FlatsListCtrl", ['$scope',
    '$meteor', '$rootScope', '$state', '$stateParams', '$mdDialog',
    function($scope, $meteor, $rootScope, $state, $stateParams, $mdDialog) {

        if ($rootScope.building == null || $stateParams.buildingId == '') $state.go('buildings');

        $scope.sort = {
            no: 1
        };
        $scope.currentFlatId = '';
        $meteor.autorun($scope, function() {
            $scope.$meteorSubscribe('flats', {
                    onStop: notifyUser
                }, $stateParams.buildingId)
                .then(function(subscriptionHandle) {
                    $scope.flats = $meteor.collection(Flats);
                    $scope.flatsCount = Flats.find().count();
                });
        });

        function notifyUser(err) {
            if (err)
                $rootScope.showSimpleToast(err.reason);
            else
                $rootScope.showSimpleToast('Flats subscription was stopped.');
        }

        $scope.displayFlat = function(flatId) {
            $scope.currentFlatId = flatId;
            $scope.$broadcast('flatEvent', flatId);
        };

        $scope.addFlat = function() {
            var f = $scope.flatsCount + 1;
            $scope.newFlat = {
                'no': f
            };
            $scope.newFlat.owner = $rootScope.currentUser._id;
            $scope.newFlat.buildingId = $stateParams.buildingId;
            var newAddedFlat = $scope.flats.save($scope.newFlat).then(function(nofDocs) {
                $scope.flatsCount++;
                $scope.displayFlat(nofDocs[0]._id);
            }, function(error) {
                console.log("flat create error", error);
            });
        };

    }
]).directive('flats', function() {
    return {
        restrict: 'E',
        templateUrl: 'client/flats/views/flats-list.ng.html',
        controller: 'FlatsListCtrl',
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