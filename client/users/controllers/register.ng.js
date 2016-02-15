angular.module("super").controller("RegisterCtrl", ['$state','$scope','$rootScope','$translate',
  function ($state, $scope,$rootScope,$translate) {
 
    $scope.user = {
      email: '',
      password: '',
      profile: {}
    };
    
    $scope.changeLang = function() {
      try {
      $translate.use($scope.user.profile.language);
      } catch(e) {
        console.log('error',e);
      }
    }
    
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