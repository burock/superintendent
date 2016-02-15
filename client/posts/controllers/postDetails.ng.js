angular.module("super").controller("PostDetailsCtrl", ['$scope',
     '$rootScope', '$state', '$stateParams', '$mdDialog', '$translate',
    function($scope, $rootScope, $state, $stateParams, $mdDialog, $translate) {

        $scope.$on('postEvent', function(event, postId) {
            $scope.post = Posts.findOne({_id : postId });
        });

        $scope.deletePost = function(post) {
            $rootScope.confirmDelete($translate.instant("POST"), post.title).then(
                function(data) {
                    if (data){ Posts.remove(post._id);
                        $scope.post = {};
                        $scope.$parent.flip();
                        $scope.postForm.$setUntouched();
                    }
                    
                });
        };

        $scope.savePost = function() {
            Posts.update({_id: $scope.post._id }, {
                $set: {
                    title: $scope.post.title,
                    body : $scope.post.body
                }
            })
            $scope.$parent.flip();
            $rootScope.showSimpleToast(this, $translate.instant('SAVED'));
        };

        $scope.resetPost = function() {
            $scope.post.reset();
        };

    }
]).directive('postdetails', function() {
    return {
        restrict: 'E',
        templateUrl: 'client/posts/views/post-details.ng.html',
        transclude: true,
        scope: {
            post: '='
        },
        controller: 'PostDetailsCtrl'
    };
});