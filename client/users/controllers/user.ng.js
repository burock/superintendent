angular.module("super").controller("UserCtrl", ['$meteor', '$state','$scope',
  function ($meteor, $state, $scope) {
    $scope.user = $meteor.getUser();
 
    $scope.saveUser = function () {
        Meteor.user.save();
    };
  }
]);