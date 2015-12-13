angular.module("super").controller("RegisterCtrl", ['$meteor', '$state','$scope','$rootScope',
  function ($meteor, $state, $scope,$rootScope) {
 
    $scope.user = {
      email: '',
      password: '',
      profile: {}
    };
 
    $scope.error = '';
 
    $scope.register = () => {
        Accounts.createUser($scope.user, (err) => {
          if (err) {
            $scope.error = err.reason;
            $rootScope.showSimpleToast(this,$scope.error);
          }
          else {
            $state.go('buildings');
          }
        });
      };
      
  }
]);