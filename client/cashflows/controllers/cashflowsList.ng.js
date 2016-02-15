angular.module("super").controller("CashflowsListCtrl", ['$scope', 
    '$rootScope', '$state', '$stateParams','$mdDialog','$translate','$reactive','$mdBottomSheet',
function ($scope, $rootScope, $state, $stateParams, $mdDialog, $translate, $reactive, $mdBottomSheet) {
      $reactive(this).attach($scope);
      if ($rootScope.building==null || $stateParams.buildingId == '') $state.go('buildings');
      $scope.cashflowId = $stateParams.cashflowId;
      $scope.currentCashflowId= '';
      $scope.buildingId = $stateParams.buildingId;
      $scope.sort = { date : -1 };
      $scope.page = 1;
      $scope.filterPaid = '';
      $scope.filterFlat = '';
      $scope.filterCashflows = '';
      $scope.filterCashflowId = '';
      $scope.perPage = 5;

      $scope.flip = function() {
			  $scope.flipped = !$scope.flipped;
		  };
      
      $scope.helpers({
          flats: () => {
              return Flats.find({buildingId: $scope.getReactively('buildingId') }, { sort: { no: 1}});
          },
          cashflowsCount: () => { return Counts.get('numberOfCashflows'); },
          cashflows: () => { 
            return Cashflows.find({} , { sort: $scope.getReactively('sort')} ) 
          },
          cashflow : () => {
                return Cashflows.findOne($scope.getReactively('currentCashflowId'));
            }
      });

      if ($stateParams.cashflowId) {
            $scope.currentCashflowId = $stateParams.cashflowId;
            $scope.filterCashflowId = $stateParams.cashflowId;
           // $scope.$broadcast('cashflowEvent',$scope.currentCashflowId);
      }
      
      $scope.clearSearch = function() {
        $scope.filterCashflows = '';
        $scope.filterCashflowId = '';
        $scope.filterPaid = '';
        $scope.filterFlat = '';
        $scope.hideMe();
      }
      
      $scope.hideMe = function() {
        $mdBottomSheet.hide();
      }
      
      
      $scope.subscribe('flats', () => {
            return [
                 {buildingId: $scope.getReactively('buildingId') },
                  { sort : { no : 1 } }
            ]
      });
        
      $scope.subscribe('projects', () => {
        return [
          {
            buildingId: $scope.buildingId, 
            projectId: '',
            filter: ''
          }
        ]
      });
      
      $scope.subscribe('cashflows', () => {
          return [
              {
                buildingId: $stateParams.buildingId ,
                cashflowId:$scope.getReactively('filterCashflowId'),
                filter: $scope.getReactively('filterCashflows'),
                filterPaid : $scope.getReactively('filterPaid'),
                filterFlat : $scope.getReactively('filterFlat')
              },
              {
                limit: parseInt($scope.perPage),
                skip: (parseInt($scope.getReactively('page')) - 1) * parseInt($scope.perPage),
                sort: $scope.getReactively('sort')
              }
          ]
      });
      
      $scope.pageChanged = function(newPage) {
        $scope.page = newPage;
      };
                
      $scope.displayCashflow = function (cashflowId) { 
        $scope.currentCashflowId = cashflowId;
        $scope.flip();
        $scope.checkAmount();
      };
      
       $scope.openSearchSheet = function($event) {
            $mdBottomSheet.show({
              templateUrl: 'client/cashflows/views/search-sheet-tmpl.ng.html',
              clickOutsideToClose: true,
              escapeToClose: true,
              targetEvent: $event,
              preserveScope: true,
              scope: $scope,
              disableParentScroll: true
            }).then(function(clickedItem) {
              console.log(clickedItem);
              
            });
        }    
      $scope.addnew = function () {
        $scope.newCashflow = {
            'description' : $translate.instant('NEW'),
            'amount': 0,
            'currency' : $rootScope.building.currency,
            'date' : new Date(),
            'captureDate' : new Date(),
            'type' : 'dues'
        };
        $scope.newCashflow.owner = $rootScope.cUser._id;
        $scope.newCashflow.buildingId = $stateParams.buildingId;
        Cashflows.insert($scope.newCashflow, function(err, data) {
            if (err)
              console.log('Error inserting cashflow', err);
            else {
              $scope.sort = { date : -1 };
              $scope.filterCashflowId = data;
              $scope.displayCashflow(data);
            }
              
        });
          
      };
      
      $scope.checkAmount = function() {
            if ($scope.cashflow)
                if ($scope.cashflow.type=='payment'||$scope.cashflow.type=='bill') {
                    if ($scope.cashflow.amount>0) {
                        $scope.cashflow.amount *= -1; 
                        $scope.dirty = true;
                    }
                } else {
                    if  ($scope.cashflow.amount<0) {
                        $scope.dirty = true;
                        $scope.cashflow.amount *= -1; 
                    }
                }
        };
}]); 