angular.module("super").controller("ProjectDetailsCtrl", ['$scope',
    '$meteor', '$rootScope', '$state', '$stateParams', '$mdDialog', '$translate',
    function($scope, $meteor, $rootScope, $state, $stateParams, $mdDialog, $translate) {

        $scope.$on('projectEvent', function(event, projectId) {
            $scope.project = $meteor.object(Projects, projectId, false);
        });

        if ($stateParams.projectId) {
          $scope.project =  $meteor.object(Projects, $stateParams.projectId, false);
          $scope.$parent.currentProjectId =  $stateParams.projectId;
        }
        
        $scope.deleteProject = function(project) {
            $rootScope.confirmDelete($translate.instant("PROJECT"), project.title).then(
                function(data) {
                    if (data) $scope.$parent.projects.remove(project);
                });
                
        };

        $scope.saveProject = function() {
            $scope.project.save();
            $rootScope.showSimpleToast(this, "Saved");
        };

        $scope.resetProject = function() {
            $scope.project.reset();
        };

    }
]).directive('projectdetails', function() {
    return {
        restrict: 'E',
        templateUrl: 'client/projects/views/project-details.ng.html',
        controller: 'ProjectDetailsCtrl',
        scope: {
            id : '@'
        },
        link: function($scope, element, attrs) {
            element.on('click', function() {
                //element.html('You clicked me!');
            });
            element.on('mouseenter', function() {
                //element.css('background-color', 'yellow');
            });
            element.on('mouseleave', function() {
                //element.css('background-color', 'white');
            });
        }
    };
});