angular.module("super").controller("FlatsListCtrl", ['$scope',
    '$rootScope', '$state', '$stateParams', '$mdDialog','$reactive','$mdMedia','$translate',
    function($scope, $rootScope, $state, $stateParams, $mdDialog, $reactive,$mdMedia, $translate) {
        $reactive(this).attach($scope);
        
        if ($rootScope.building == null || $stateParams.buildingId == '') $state.go('buildings');
        
        $scope.fpageChanged = function(newPage) {
            $scope.fpage = newPage;
        };
        $scope.pageChanged = function(newPage) {
            $scope.page = newPage;
        };
        
        $scope.isBig = $mdMedia('gt-sm');
        $scope.buildingId = $stateParams.buildingId;
        $scope.showDetails = false;
        $scope.currentFlatId = '';
        
        $scope.fsort = {no: 1};
        $scope.flipped = false;
        $scope.fpage = 1;
        $scope.fperPage = 4;
        $scope.perPage = 5;
        $scope.fcurrentPage = 1;
        $scope.page = 1;
        $scope.sort = { date : -1 };
        $scope.query = {
            paid : false
        };
        
        $scope.helpers({
            cashflowsCount: () => { return Counts.get('numberOfCashflowsByFlat'); },
            cashflows: () => { 
                return Cashflows.find();
            },           
            numberOfFlats: () => { 
                return Counts.get('numberOfFlats'); },
            flats: () => {
                return Flats.find({});
            },
            flat : () => {
                return Flats.findOne($scope.getReactively('currentFlatId'));
            }
        });
        
        $scope.subscribe('cashflowsByFlat', () => {
            return [
              {
                  flatId : $scope.getReactively('currentFlatId'),
                  filterPaid : $scope.getReactively('query.paid')
              },
              {
                limit: parseInt($scope.perPage),
                skip: (parseInt($scope.getReactively('page')) - 1) * parseInt($scope.perPage),
                sort: $scope.getReactively('sort')
              }
            ]
        });  
        
        $scope.subscribe('flats', () => {
            return [
              {buildingId: $scope.getReactively('buildingId') }
                ,
              {
                limit: parseInt($scope.fperPage),
                skip: (parseInt($scope.getReactively('fpage')) - 1) * parseInt($scope.fperPage),
                sort: $scope.getReactively('fsort')
              }
            ]
        });
        
        $scope.flip = function() {
			$scope.flipped = !$scope.flipped;
		};
		
        $scope.displayFlat = function(flatId) {
            $scope.currentFlatId = flatId;
            $scope.filterPaid = false;
            $scope.flip();
        };

        $scope.addFlat = function() {
            var last = Math.ceil(($scope.numberOfFlats+1) / $scope.fperPage);
            if (last==0) last = 1;
            $scope.fpageChanged(last);
            var f = 0;
            try {
                f = parseInt($scope.numberOfFlats) + 1;
            } catch(e) {
                f = 0;
            }
            $scope.newFlat = {
                no: f,
                allotment:0,
                dues: 0,
                flatOwner: 'n/a',
                flatOwnerEmail : 'n@aaa.com'
            };
            $scope.newFlat.owner = $rootScope.cUser._id;
            $scope.createDate = new Date();
            $scope.newFlat.buildingId = $stateParams.buildingId;
            var newAddedFlat = Flats.insert($scope.newFlat, function(error, data) {
                if (error) 
                    console.log('error',error);
                $scope.newFlat._id = data;
                //$scope.displayFlat(data);
            });
            
        };

        $scope.deleteFlat = function(flat) {
            $rootScope.confirmDelete($translate.instant("FLAT"), $scope.flat.no).then(
                function(data) {
                    Flats.remove(flat._id);
                    $scope.flip();
                });
        };
        
        $scope.displayCashflow = function(cashId) {
            $state.go('cashflows', { buildingId : $stateParams.buildingId, cashflowId : cashId});
        }

        $scope.saveFlat = function() {
            if (!$scope.flat._id) {
                console.log('failed to save',$scope.flat);
            }
            Flats.update($scope.flat._id, {
                $set: {
                    no : $scope.flat.no,
                    phone: $scope.flat.phone,
                    ownerAddress: $scope.flat.ownerAddress,
                    flatOwner: $scope.flat.flatOwner,
                    flatOwnerEmail : $scope.flat.flatOwnerEmail,
                    tenant : $scope.flat.tenant,
                    tenantEmail : $scope.flat.tenantEmail,
                    tenantPhone : $scope.flat.tenantPhone,
                    dues : $scope.flat.dues,
                    allotment: $scope.flat.allotment
                }                
            }, function(err, data) {
                if (err) console.log('Error',err);
            });
            $scope.flip();
            $rootScope.showSimpleToast(this, $translate.instant('SAVED'));
        };

    }
]);