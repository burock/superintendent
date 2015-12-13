angular.module("super").controller("MyFlatsListCtrl", ['$scope',
    '$meteor', '$rootScope', '$stateParams', 'currentUser',
    function($scope, $meteor, $rootScope, $stateParams, currentUser) {
        console.log(currentUser);
        $scope.sort = {
            no: 1
        };
        $meteor.autorun($scope, function() {
            $scope.$meteorSubscribe('myflats', {
                    onStop: notifyUser
                }, currentUser.emails[0].address)
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

    }
]);