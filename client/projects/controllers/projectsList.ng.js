angular.module("super").controller("ProjectsListCtrl", ['$scope',
    '$meteor', '$rootScope', '$state', '$stateParams', '$mdDialog', '$translate',
    function($scope, $meteor, $rootScope, $state, $stateParams, $mdDialog, $translate) {
        $scope.sort = {
            startDate: -1
        };
        $scope.filterProjects = '';
        $scope.filterProjectId = '';
        $scope.filterFinished = '';
          
        if ($stateParams.projectId) {
            $scope.filterProjectId = $stateParams.projectId;
        }
        
        $scope.clearSearch = function() {
            $scope.filterProjects = '';
            $scope.filterProjectId = '';
            $scope.filterFinished = '';
        }
        
        $scope.currentProjectId = '';

        if ($rootScope.building == null || $stateParams.buildingId == '') $state.go('buildings');

        $meteor.autorun($scope, function() {
            $scope.$meteorSubscribe('projects', {
                    onStop: notifyUser,
                    sort:  $scope.getReactively('sort')
                },{ buildingId: $stateParams.buildingId, 
                   projectId: $scope.getReactively('filterProjectId'),
                   filter: $scope.getReactively('filterProjects')})
                .then(function(subscriptionHandle) {
                    $scope.projects = $meteor.collection(function() {
                        return Projects.find({}, {
                          sort : $scope.getReactively('sort')
                        });
                    });
                    $scope.projectsCount = Projects.find().count();
                });
        });

        function notifyUser(err) {
            if (err)
                $rootScope.showSimpleToast(err.reason);
            else
                $rootScope.showSimpleToast('projects subscription was stopped.');
        };

        $scope.displayProject = function(projectId) {
            $scope.currentProjectId = projectId;
            $scope.$broadcast('projectEvent', projectId);
        };

        $scope.addProject = function() {
            $scope.newProject = {
                'title': $translate.instant('NEW'),
                'detail': '',
                'startDate': new Date(),
                'endDate': new Date(),
                'cost': 0,
                'finished': false
            };
            $scope.newProject.owner = $rootScope.currentUser._id;
            $scope.newProject.buildingId = $stateParams.buildingId;
            var newAddedProject = $scope.projects.save($scope.newProject).then(function(nofDocs) {
                $scope.projectsCount++;
                $scope.displayProject(nofDocs[0]._id);
            }, function(error) {
                console.log("project create error", error);
            });
        };

    }
]).directive('projects', function() {
    return {
        restrict: 'E',
        templateUrl: 'client/projects/views/projects-list.ng.html',
        controller: 'ProjectsListCtrl',
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