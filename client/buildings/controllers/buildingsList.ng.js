angular.module("super").controller("BuildingsListCtrl", 
  ['$scope', '$location', '$rootScope', '$state', '$mdDialog', '$translate','$stateParams',
function ($scope, $location, $rootScope, $state, $mdDialog, $translate,$stateParams) {
  
  
  $scope.helpers({
    buildings() {
      return Buildings.find({});
    },
    
    buildingsCount() {
      return Buildings.find().count();
    }

  });
  
  $scope.subscribe('buildings');
  
  /*$scope.subscribe('buildings', () => {
      return [
        {onStop: notifyUser}//, $stateParams.buildingId
      ]
  });
 */
 
  function notifyUser(err) {
        if (err)
          $rootScope.showSimpleToast(err.reason);
        else
          $rootScope.showSimpleToast('buildings subscription was stopped.');
    }  
  
  $scope.goto = function (id) {
    $rootScope.loadMenu(id);
    $state.go('buildingDetails',{ buildingId: id });  
  };
  
  $scope.addBuilding = function () {
    $scope.newBuilding = {
        'name': $translate.instant('NEW')
    };
    $scope.newBuilding.owner=$rootScope.cUser._id;
    
    var id = Buildings.insert($scope.newBuilding, function(err, data) {
        if (err)
          $rootScope.showSimpleToast(this, 'Error occured ' + err.reason);
        else
          $state.go('buildingDetails', { buildingId:data });
    });
    
    
  };
  
}]);