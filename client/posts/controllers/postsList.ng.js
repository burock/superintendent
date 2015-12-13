angular.module("super").controller("PostsListCtrl", ['$scope',
    '$meteor', '$rootScope', '$state', '$stateParams', '$mdDialog', '$translate',
    function($scope, $meteor, $rootScope, $state, $stateParams, $mdDialog, $translate) {

        $scope.page = 1;
        $scope.perPage = 5;
        $scope.sort = {
            date: -1
        };
        $scope.currentPostId = '';
        if ($rootScope.building == null || $stateParams.buildingId == '') $state.go('buildings');

        //$scope.posts = $meteor.collection(Posts).subscribe('posts',
        //          { sort: $scope.sort, filter: $scope.params }, $rootScope.building._id);

        $meteor.autorun($scope, function() {
            $scope.$meteorSubscribe('posts', {
                    onStop: notifyUser,
                    limit: parseInt($scope.getReactively('perPage')),
                    skip: (parseInt($scope.getReactively('page')) - 1) * parseInt($scope.getReactively('perPage')),
                    sort: $scope.getReactively('sort')
                }, $stateParams.buildingId)
                .then(function(subscriptionHandle) {
                    $scope.posts = $meteor.collection(function() {
                        return Posts.find({}, {
                          sort : $scope.getReactively('sort')
                        });
                    });
                    $scope.postsCount = $meteor.object(Counts ,'numberOfPosts', false);
                });
        });

      $scope.pageChanged = function(newPage) {
        $scope.page = newPage;
      };

        function notifyUser(err) {
            if (err)
                $rootScope.showSimpleToast(err.reason);
            else
                $rootScope.showSimpleToast('posts subscription was stopped.');
        };

        $scope.displayPost = function(postId) {
            $scope.currentPostId = postId;
            $scope.$broadcast('postEvent', postId);
        };

        $scope.addPost = function() {
            $scope.newPost = {
                'title': $translate.instant('NEW'),
                'body': '',
                'date': new Date()
            };
            $scope.newPost.owner = $rootScope.currentUser._id;
            $scope.newPost.by = $rootScope.currentUser;
            $scope.newPost.buildingId = $stateParams.buildingId;
            var newAddedPost = $scope.posts.save($scope.newPost).then(function(nofDocs) {
                $scope.sort = { date : -1 };
                $scope.displayPost(nofDocs[0]._id);
            }, function(error) {
                console.log("post create error", error);
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