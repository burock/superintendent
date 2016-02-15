angular.module("super").controller("CashflowGenController", ['$scope',
     '$rootScope', '$state', '$stateParams', '$mdDialog', '$translate','$mdMedia',
    function($scope, $rootScope, $state, $stateParams, $mdDialog, $translate, $mdMedia) {
        $scope.total = {};
        $scope.cash = { amount:0, date: new Date() };
        $scope.buildingId = $stateParams.buildingId;
        $scope.cashflows = {};
        $scope.sort = {no: 1};
        
         $scope.helpers({
            flats: () => {
                return Flats.find({buildingId: $stateParams.buildingId});
            },
            flatsCount: () => {
                return Flats.find({buildingId: $stateParams.buildingId}).count();  
            }
        });
        
        $scope.subscribe('flats', () => {
            return [
                {buildingId: $stateParams.buildingId},{}
            ]
        });
        
        $scope.showDialog = function() {
			    $mdDialog.show({
			      templateUrl: 'client/projects/views/cashflows-flats.tmpl.ng.html',
			      locals : { flats : $scope.flats, total : {}, projectId: $scope.project._id },
			      bindToController: true,
			      controller : DialogCtrl,
			      parent: angular.element(document.body),
			      clickOutsideToClose:true,
			      fullscreen: $mdMedia('sm') && $scope.customFullscreen
		        });
		};
		
		function DialogCtrl($mdDialog, $scope, flats, $rootScope, $translate, projectId) {
            $scope.flats = flats;
            $scope.projectId = projectId;
            $scope.cancel = function() {
		        $mdDialog.hide();    
		 };
		    
		    $scope.confirmCashflows = function() {
		        if ($rootScope.confirmIt($translate.instant('R_U_SURE_CREATECASHFLOWS'))) {
		            Meteor.call("generateCash", $scope.flats, $scope.projectId, function (err, data) {
		                if (err) {
		                    console.log("Error occured", err);
		                } else {
		                    $rootScope.showSimpleToast(this, $translate.instant('DONE'));
		                }
		            });
		        }
                $scope.cancel();
            };
        }
        
        $scope.mobile = false;
        $scope.autorun(function() {
           $scope.mobile = !$mdMedia('gt-sm');
        });
        var ExitException = {};
        
        $scope.calculate = function () {
            var equal = false;
            
            if ($scope.project.paymenttype==1) equal = true;
            var sum = $scope.getTotal();
            
            if ($scope.getTotal()<$scope.project.cost) {
                $scope.showAlert($translate.instant('LESS_THAN_COST'));
                return ;
            }

            try {
                $scope.total = {};
            } catch(e) {
                console.log("err",e);
            }
            
            $scope.flats.forEach(function(flat) {
                if (!flat.allotment || flat.allotment==0) {
                    $scope.showAlert($translate.instant('MISSING_ALLOTMENT', {flats: flat.no}));
                    throw ExitException;
                } else {
                    flat.payments = [];
                    var cnt = 1;
                    $scope.project.cashflows.forEach(function(cash) {
                        try {
                            var c = {};
                            c.paymentAmount = (equal? (cash.amount/$scope.flatsCount).toFixed(2) : 
                                            (cash.amount * (flat.allotment / 100)).toFixed(2) );
                            c.paymentDate = cash.date;
                            c.paymentDescr = $scope.project.title + '-' + cnt++;
                            c.projectId = $scope.project._id;
                            c.currency = $rootScope.building.currency;
                            flat.payments.push(c);
                        } catch (e) {
                            console.log("error at payment push",e);
                        } 
                    });
                }
            });
            $scope.showDialog();
        }
        
        $scope.showAlert = function(word) {
          $mdDialog.show(
              $mdDialog.alert()
                .clickOutsideToClose(true)
                .title(word)
                .ok($translate.instant('OK'))
            );
        }
        
        $scope.addCashflow = function(cash) {
            if (!$scope.project.cashflows)
                $scope.project.cashflows = [];
            if (cash.amount==0) return ;
            
            if (cash.amount>$scope.project.cost) {
                $scope.showAlert($translate.instant('MORE_THAN_COST'));
                return ;
            }
            var sum = $scope.getTotal();
            
            if (sum==$scope.project.cost) {
                $scope.showAlert($translate.instant('TOTAL_OK'));
                return ;
            }

            if ((sum+cash.amount)>$scope.project.cost) {
                $scope.showAlert($translate.instant('MORE_THAN_COST_BUT', { amount: ($scope.project.cost-sum)  }));
                return ;
            }
            
            var c = {};
            c.id = new Meteor.Collection.ObjectID();
            c.amount = cash.amount;
            c.date = cash.date;
            $scope.cash = { amount: 0, date: new Date() };
            $scope.project.cashflows.push(c);
        }
        
        $scope.getTotal = function(arr) {
            try {                
                if (!arr) arr = $scope.project.cashflows; 
                var o = arr.reduce(function (a, b) {  return a + b.amount; }, 0);
                return o;
            } catch(e) {
                return 0;
            }
        }
        
        $scope.removeCashflow = function(c) {
            var i = 0;
            $scope.project.cashflows.forEach( function(z) {
                if (c.id==z.id) {
                    $scope.project.cashflows.splice(i,1);
                }
                i++;
            });
        }
        
        $scope.saveProject = function() {
             Projects.update( { _id : $scope.project._id }, {
                $set : {
                    title: $scope.project.title,
                    cost : $scope.project.cost,
                    startDate : $scope.project.startDate,
                    endDate : $scope.project.endDate,
                    detail : $scope.project.detail,
                    finished : $scope.project.finished,
                    cashflows : $scope.project.cashflows,
                    paymenttype : $scope.project.paymenttype
                }
            });
            $rootScope.showSimpleToast(this, $translate.instant("SAVED"));
        }
    }
]).directive('cashflowgenerate', function() {
    return {
        restrict: 'E',
        templateUrl: 'client/projects/views/cashflow-generate.ng.html',
        controller: 'CashflowGenController',
        transclude: true,
        scope: {
            project: '='
        }
    };
});