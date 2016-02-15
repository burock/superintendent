angular.module("super").controller("ProjectDetailsCtrl", ['$scope',
     '$rootScope', '$state', '$stateParams', '$mdDialog', '$translate', '$reactive',
    function($scope, $rootScope, $state, $stateParams, $mdDialog, $translate, $reactive) {
        $reactive(this).attach($scope);

        
        $scope.deleteProject = function(project) {
            $rootScope.confirmDelete($translate.instant("PROJECT"), project.title).then(
                function(data) {
                    if (data) Projects.remove(project._id);
                    $scope.$parent.clearSearch();
                    $scope.$parent.flip();
                    $scope.projectForm.$setUntouched();
                });
        };

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
            $scope.$parent.clearSearch();
            $scope.$parent.flip();
            $rootScope.showSimpleToast(this,$translate.instant("SAVED"));
        };
        
        $scope.cancel = function() {
            $mdDialog.hide();
        }
        
    }
]).directive('projectdetails', function() {
    return {
        restrict: 'E',
        templateUrl: 'client/projects/views/project-details.ng.html',
        controller: 'ProjectDetailsCtrl',
        transclude: true,
        scope: {
            project : '='
        },
    };
});