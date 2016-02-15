angular.module("super").controller("ProjectsListCtrl", ['$scope',
    '$reactive', '$rootScope', '$state', '$stateParams', '$mdDialog', '$translate','$mdBottomSheet',
    function($scope, $reactive, $rootScope, $state, $stateParams, $mdDialog, $translate,$mdBottomSheet) {
        $reactive(this).attach($scope);
        
        if ($rootScope.building == null || $stateParams.buildingId == '') $state.go('buildings');
        $scope.perPage = 4;
        $scope.buildingId = $stateParams.buildingId;
        $scope.projectId = $stateParams.projectId;
        $scope.currentProjectId = '';
        $scope.filterProjects = '';
        $scope.filterProjectId = '';
        $scope.filterFinished = '';
        $scope.sort={ startDate: -1 };
        $scope.page=1;
        
        $scope.flip = function() {
			$scope.flipped = !$scope.flipped;
		};
		
        $scope.helpers({
              projectsCount: () => { return Counts.get('numberOfProjects'); },
              projects: () => { 
                  return Projects.find(
                    {
                        /*buildingId: $scope.getReactively('buildingId'),
                        finished: $scope.getReactively('filterFinished')==='true',*/
                    }
                  , { sort: $scope.sort} ) 
                  
              },
              project : () => {
                  return Projects.findOne($scope.getReactively('currentProjectId'));
              }
        });
        
        if ($stateParams.projectId) {
            $scope.currentProjectId = $stateParams.projectId;
            $scope.filterProjectId = $stateParams.projectId;
        }

        $scope.displayProject = function(projectId) {
            $scope.currentProjectId = projectId;
            $scope.flip();
        };
          
        $scope.clearSearch = function() {
            $scope.filterProjects = '';
            $scope.filterProjectId = '';
            $scope.filterFinished = '';
            $scope.hideMe();
        }
        
        $scope.hideMe = function() {
            $mdBottomSheet.hide();
        }
        
        $scope.pageChanged = function(newPage) {
            $scope.page = newPage;
        };
        
        $scope.openSearchSheet = function($event) {
            $mdBottomSheet.show({
              templateUrl: 'client/projects/views/search-sheet-tmpl.ng.html',
              clickOutsideToClose: true,
              escapeToClose: true,
              targetEvent: $event,
              preserveScope: true,
              scope: $scope,
              disableParentScroll: true
            }).then(function(clickedItem) {
            });
        }        
        
      $scope.subscribe('projects', () => {
          return [
              {
                buildingId: $scope.getReactively('buildingId'), 
                projectId: $scope.getReactively('filterProjectId'),
                filter: $scope.getReactively('filterProjects'),
                finished : $scope.getReactively('filterFinished')
              },
              {
                limit: parseInt($scope.perPage),
                skip: (parseInt($scope.getReactively('page')) - 1) * parseInt($scope.perPage),
                sort: $scope.sort
              }
          ]
      });
        
        $scope.addProject = function() {
            $scope.newProject = {
                'title': $translate.instant('NEW'),
                'detail': '',
                'startDate': new Date(),
                'endDate': new Date(),
                'cost': 0,
                'finished': false
            };
            $scope.newProject.owner = $rootScope.cUser._id;
            $scope.newProject.buildingId = $stateParams.buildingId;
            Projects.insert($scope.newProject, function(err,data) {
                if (err)
                  console.log('Error inserting project', err);
                else {
                  $scope.sort = { startDate : -1 };
                  $scope.projectsCount++;
                  $scope.filterProjectId = data;
                  $scope.displayProject(data);
                }
            });
        };
   
    }
]);/*.directive('projects', function() {
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
});*/