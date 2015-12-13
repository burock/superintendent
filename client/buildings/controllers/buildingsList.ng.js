angular.module("super").controller("BuildingsListCtrl", 
  ['$scope', '$meteor', '$location', '$rootScope', '$state', '$mdDialog', '$translate','$stateParams',
function ($scope, $meteor, $location, $rootScope, $state, $mdDialog, $translate,$stateParams) {
  
  
 /* $scope.$meteorSubscribe('buildings',
        {onStop: notifyUser}, $stateParams.buildingId)
        .then(function(subscriptionHandle){
        $scope.buildings = $meteor.collection(Buildings);
        $scope.buildingsCount =Buildings.find().count();
  });      */
  
  $scope.helpers({
    buildings() {
      return Buildings.find({});
    },
    
    buildingsCount() {
      return Buildings.find().count();
    }

  });
  
  $scope.subscribe('buildings', () => {
      return [
        {onStop: notifyUser}, $stateParams.buildingId
      ]
  });
 
 
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
    $scope.newBuilding.owner=$rootScope.currentUser._id;
    var newBuilt = $scope.buildings.save($scope.newBuilding).then(function (nofDocs) {
      }, function(error) {
          console.log("building create error", error);
      });
  };
  
}]);