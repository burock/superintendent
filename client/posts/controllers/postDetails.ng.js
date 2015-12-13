angular.module("super").controller("PostDetailsCtrl", ['$scope',
    '$meteor', '$rootScope', '$state', '$stateParams', '$mdDialog', '$translate',
    function($scope, $meteor, $rootScope, $state, $stateParams, $mdDialog, $translate) {

        $scope.$on('postEvent', function(event, postId) {
            $scope.post = $meteor.object(Posts, postId, false);
        });

        $scope.deletePost = function(post) {
            $rootScope.confirmDelete($translate.instant("POST"), post.title).then(
                function(data) {
                    if (data) $scope.posts.remove(post);
                });
                
        };

        $scope.savePost = function() {
            $scope.post.save();
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
        controller: 'PostDetailsCtrl',
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