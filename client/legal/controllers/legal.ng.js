angular.module("super").controller("LegalCtrl", ['$scope',
    '$rootScope', '$state', '$stateParams', '$reactive','$compile','$translate','$parse',
    function($scope, $rootScope, $state, $stateParams, $reactive, $compile, $translate,$parse) {
        if ($rootScope.building == null || $stateParams.buildingId == '') $state.go('buildings');
        $reactive(this).attach($scope);
        $scope.buildingId = $stateParams.buildingId;
        $scope.perPage = 4;
        $scope.buildingId = $stateParams.buildingId;
        $scope.sort = {
                formDate: -1
            };
        $scope.page = 1;
        $scope.legal = {};
        
        $scope.form = "";
        $scope.picked = false;
        $scope.printing = false;
        $scope.currentFlatId = '';
        
        $scope.formattedDate = function(d) {
            if (!d) d = $scope.legal.formDate;
            return moment(d).format('DD-MM-YYYY');  
        };
        
        $scope.helpers({
            numberOfFlats: () => { 
                return Counts.get('numberOfFlats'); },
            flats: () => {
                return Flats.find({});
            },
            legalsCount: () => { 
                return Counts.get('legalsCount'); },
            legals: () => {
                return Legals.find({});
            }
        });
       $scope.subscribe('legals', () => {
            return [
                {
                    buildingId: $scope.getReactively('buildingId')
                },
                {
                    limit: parseInt($scope.perPage),
                    skip: (parseInt($scope.getReactively('page')) - 1) * parseInt($scope.perPage),
                    sort: $scope.sort
                }
            ]
        });
        
      $scope.pageChanged = function(newPage) {
        $scope.page = newPage;
      };
      
        $scope.subscribe('flats', () => {
            return [
              {buildingId: $scope.getReactively('buildingId') }
                ,
              {
                sort: { no: 1 } 
              }
            ]
        });

        $scope.pickFlat = function() {
            $scope.currentFlatId = $scope.cf;
            $scope.flat = Flats.findOne($scope.getReactively('currentFlatId'));
            if ($scope.flat) {
                if ($scope.flat.tenant)
                    $scope.legal.whom = $scope.flat.tenant;
                else {
                    $scope.no_tenant = $translate.instant('NO_TENANT');
                    $scope.legal.whom = $scope.flat.flatOwner;  
                }
            }
        };
        
        $scope.getForm = function(template) {
            $scope.form = 'client/legal/views/' + template;
            $scope.picked = true;
        };
        
        $scope.clear = function() {
            $scope.no_tenant = '';
            $scope.picked = false;
            $scope.printing = false;
            $scope.legal = {};
        };
        
        $scope.deleteLegal = function(l) {
            $rootScope.confirmDelete($translate.instant("FORM"), l.title).then(
                function(data) {
                    if (data) {
                        Legals.remove(l._id);
                    }
                });
        };
        
        $scope.printDiv = function(divName) {
            $scope.printing = true;
            if (!$scope.legal._id) {
                try {
                $scope.legal.buildingId = $scope.buildingId;
                $scope.legal.owner = $rootScope.cUser._id;
                $scope.legal.building = $rootScope.building.name;
                Legals.insert($scope.legal, function(err,data) {
                    if (err) console.log('error', err);
                    if (data) {
                        $scope.legal._id = data._id;
                        console.log('l',$scope.legal);
                    }
                });
                } catch (e) {}
            }
            var printContents = document.getElementById(divName).innerHTML;
            var popupWin = window.open('', '_blank', 'width=420px,height=594px');
            popupWin.document.open()
            popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="/index.css" /><link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/angular_material/0.11.2/angular-material.min.css"></head><body onload="window.print()">' + printContents + '</html>');
            popupWin.document.close();
            $scope.printing = false;
        }; 
    }
]);