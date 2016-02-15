angular.module("super").controller("PostsListCtrl", ['$scope',
     '$rootScope', '$state', '$stateParams', '$mdDialog', '$translate','$reactive',
    function($scope, $rootScope, $state, $stateParams, $mdDialog, $translate, $reactive) {
        $reactive(this).attach($scope);
        if ($rootScope.building == null || $stateParams.buildingId == '') $state.go('buildings');

        $scope.perPage = 4;
        $scope.currentPostId = '';
        $scope.buildingId = $stateParams.buildingId;
        $scope.sort = {
                date: -1
            };
        $scope.page = 1;

        $scope.flip = function() {
			  $scope.flipped = !$scope.flipped;
		};

        $scope.helpers({
            postsCount: () => { return Counts.get('numberOfPosts'); },
            posts: () => { return Posts.find({}, { sort: $scope.getReactively('sort') } ) },
            post : () => {
                return Posts.findOne($scope.getReactively('currentPostId'));
            }
        });
        
        if ($stateParams.postId) {
            $scope.currentPostId = $stateParams.postId;
            $scope.filterPostId = $stateParams.postId;
            $scope.$broadcast('postEvent',$scope.currentPostId);
        };
        
        $scope.subscribe('posts', () => {
            return [
                {
                    buildingId: $scope.getReactively('buildingId')
                },
                {
                    limit: parseInt($scope.perPage),
                    skip: (parseInt($scope.getReactively('page')) - 1) * parseInt($scope.perPage),
                    sort: $scope.sort
                }
            ]
        });
        
      $scope.pageChanged = function(newPage) {
        $scope.page = newPage;
      };

        $scope.displayPost = function(postId) {
            $scope.currentPostId = postId;
            $scope.$broadcast('postEvent', postId);
            $scope.flip();
        };

        $scope.addPost = function() {
            $scope.newPost = {
                'title': $translate.instant('NEW'),
                'body': '',
                'date': new Date()
            };
            $scope.newPost.owner = $rootScope.cUser._id;
            $scope.newPost.by = $rootScope.cUser;
            $scope.newPost.buildingId = $stateParams.buildingId;
            
            Posts.insert($scope.newPost, function(err, data) {
            if (err)
              console.log('Error inserting cashflow', err);
            else {
              $scope.sort = { date : -1 };
              $scope.displayPost(data);
            }
              
        });
          
        };

    }
]).directive('posts', function() {
    return {
        restrict: 'E',
        templateUrl: 'client/posts/views/posts-list.ng.html',
        controller: 'PostsListCtrl',
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