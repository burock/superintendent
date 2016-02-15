angular.module("super").controller("UserCtrl", ['$state','$scope',
  function ($state, $scope) {
    $scope.user = Meteor.user();
 
    $scope.saveUser = function () {
        Meteor.user.save();
    };
  }
]);