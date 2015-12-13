angular.module("super").controller("CashflowDetailsCtrl", ['$scope',
    '$meteor', '$rootScope', '$state', '$stateParams', '$mdDialog', '$translate',
    function($scope, $meteor, $rootScope, $state, $stateParams, $mdDialog, $translate) {
        $scope.$on('cashflowEvent', function(event, cashflowId) {
            $scope.cashflow = $meteor.object(Cashflows, cashflowId, false);
        });

        if ($stateParams.cashflowId) {
            $scope.cashflow = $meteor.object(Cashflows, $stateParams.cashflowId, false);
            $scope.$parent.currentCashflowId = $stateParams.cashflowId;
        }

        $scope.$meteorSubscribe('flats', {
                onStop: notifyUser
            }, $stateParams.buildingId)
            .then(function(subscriptionHandle) {
                // Bind all the books to $scope.books
                $scope.flats = $meteor.collection(Flats);
                $scope.flatsCount = Flats.find().count();
            });

        function notifyUser(err) {
            if (err)
                $rootScope.showSimpleToast(err.reason);
            else
                $rootScope.showSimpleToast('Flats subscription was stopped.');
        }

        $scope.deleteCash = function(cashflow) {
            $rootScope.confirmDelete($translate.instant("CASHFLOW"), cashflow.description).then(
                function(data) {
                    if (data) $scope.$parent.cashflows.remove(cashflow);
                });
        };

        $scope.saveCash = function() {
            $scope.cashflow.save();
            $rootScope.showSimpleToast(this, $translate.instant('SAVED'));
            /*
            .then(function(nofDocs) {
            }, function(error) {
                console.log("cashflow save error", error);
            });*/

        };

        $scope.resetCash = function() {
            $scope.cashflow.reset();
        };

    }
]).directive('cashflowdetails', function() {
    return {
        restrict: 'E',
        templateUrl: 'client/cashflows/views/cashflow-details.ng.html',
        controller: 'CashflowDetailsCtrl',
        transclude: true,
        scope: {
            id: '@'
        },
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