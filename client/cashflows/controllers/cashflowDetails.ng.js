angular.module("super").controller("CashflowDetailsCtrl", ['$scope',
     '$rootScope', '$state', '$stateParams', '$mdDialog', '$translate','$reactive',
    function($scope, $rootScope, $state, $stateParams, $mdDialog, $translate,$reactive) {
        
        $reactive(this).attach($scope);

        
        $scope.dirty = false;
        
        $scope.helpers({
            flats: () => {
                return Flats.find({buildingId: $stateParams.buildingId});
            },
            //sort: {no: 1},
           // buildingId: $stateParams.buildingId,
            projects: () => {
                return Projects.find({ finished: { $ne: true } });
            }
        });
        
        $scope.deleteCash = function(cashflow) {
            $rootScope.confirmDelete($translate.instant("CASHFLOW"), cashflow.description).then(
                function(data) {
                    if (data) {
                        Cashflows.remove(cashflow._id);
                        $scope.dirty = false;
                        $scope.$parent.clearSearch();
                        $scope.$parent.flip();
                        $scope.cashflowForm.$setUntouched();
                    }
                });
        };
        $scope.saveCashflow = function(cashflow) {
            Cashflows.update({_id: cashflow._id }, {
                $set: {
                    description : cashflow.description,
                    flat : cashflow.flat,
                    amount: cashflow.amount,
                    currency : cashflow.currency,
                    paid: cashflow.paid,
                    date : cashflow.date,
                    type : cashflow.type,
                    projectId: cashflow.projectId
                } 
            });
            $scope.dirty = false;
            $scope.$parent.clearSearch();
            $scope.$parent.flip();
            $rootScope.showSimpleToast(this, $translate.instant('SAVED'));
        };
        
        $scope.saveCash = function() {
            $scope.saveCashflow($scope.cashflow);
        };

         $scope.$watch(function scoper(scope) { return $scope.cashflow; }, function(newValue, oldValue){
            try {
            if (oldValue!=newValue)
                if ($scope.dirty) {
                    $rootScope.confirmIt($translate.instant("CHANGED", { what: oldValue.description })).then(
                        function(data) {
                        if (data) {
                            $scope.dirty = false;
                            $scope.saveCashflow(oldValue);
                        }
                    });
                }
            } catch(e) {}
         });
    }
]).directive('cashflowdetails', function() {
    return {
        restrict: 'E',
        templateUrl: 'client/cashflows/views/cashflow-details.ng.html',
        controller: 'CashflowDetailsCtrl',
        transclude: true,
        scope: {
            cashflow: '='
        },
    };
});