angular.module("super").controller("CashflowsListCtrl", ['$scope', 
    '$meteor', '$rootScope', '$state', '$stateParams','$mdDialog','$translate',
function ($scope, $meteor, $rootScope, $state, $stateParams, $mdDialog, $translate) {
 
      $scope.sort = { date : -1 };
      $scope.page = 1;
      $scope.perPage = 5;
      $scope.filterCashflows = '';
      $scope.filterCashflowId = '';
      
      if ($stateParams.cashflowId) {
        $scope.filterCashflowId = $stateParams.cashflowId;
        try {
          $scope.filterCashflows = $scope.cashflows.findOne().description;
        } catch (e) {
          console.log(e);
        }
      }
      $scope.clearSearch = function() {
        $scope.filterCashflows = '';
        $scope.filterCashflowId = '';
      }
      
      $scope.currentCashflowId = '';
      if ($rootScope.building==null || $stateParams.buildingId == '') $state.go('buildings');
      
      $meteor.autorun($scope, function() {     
        $scope.$meteorSubscribe('cashflows',
              {
                onStop: notifyUser, 
                limit: parseInt($scope.getReactively('perPage')),
                skip: (parseInt($scope.getReactively('page')) - 1) * parseInt($scope.getReactively('perPage')),
                sort: $scope.getReactively('sort'), 
              }, { buildingId: $stateParams.buildingId, 
                   cashflowId: $scope.getReactively('filterCashflowId'),
                   filter: $scope.getReactively('filterCashflows')} )
              .then(function(subscriptionHandle){
                $scope.cashflows =$meteor.collection(function() {
                  return Cashflows.find({}, {
                    sort : $scope.getReactively('sort')
                  });
                });
                $scope.cashflowsCount = $meteor.object(Counts ,'numberOfCashflows', false);
        });   
      });
      
      $scope.pageChanged = function(newPage) {
        $scope.page = newPage;
      };
                
      function notifyUser(err) {
            if (err)
              $rootScope.showSimpleToast(err.reason);
            else
              $rootScope.showSimpleToast('cashflows subscription was stopped.');
      };
      
      $scope.displayCashflow = function (cashflowId) {
        $scope.currentCashflowId = cashflowId;
        $scope.$broadcast('cashflowEvent', cashflowId);
      };
      
      $scope.addnew = function () {
        $scope.newCashflow = {
            'description' : $translate.instant('NEW'),
            'amount': 0,
            'currency' : $rootScope.building.currency,
            'date' : new Date(),
            'captureDate' : new Date()
        };
        $scope.newCashflow.owner = $rootScope.currentUser._id;
        $scope.newCashflow.buildingId = $stateParams.buildingId;
        
        var newAddedCashflow = $scope.cashflows.save($scope.newCashflow).then(function (nofDocs) {
            $scope.sort = { date : -1 };
            $scope.displayCashflow(nofDocs[0]._id);
          }, function(error) {
              console.log("cashflow create error", error);
          });
      };
      
}]).directive('cashflows', function () {
      return {
          restrict: 'E',
          templateUrl: 'client/cashflows/views/cashflows-list.ng.html',
          controller: 'CashflowsListCtrl',
          link: function ($scope, element, attrs) {
              element.on('click', function () {
                  //element.html('You clicked me!');
              });
              element.on('mouseenter', function () {
                  //element.css('background-color', 'yellow');
              });
              element.on('mouseleave', function () {
                  //element.css('background-color', 'white');
              });
          }
      };
});