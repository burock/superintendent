angular.module("super").controller("MyFlatsCtrl", ['$scope',
    '$reactive','$window','$mdDialog','$translate','$state','$mdMedia',
    function($scope, $reactive, $window, $mdDialog,$translate,$state, $mdMedia) {
        $reactive(this).attach($scope);
        $scope.email = '';
        $scope.isBig = $mdMedia('gt-sm');
        console.log($scope.isBig);
        try {
            $scope.email = Meteor.user().emails[0].address;
        } catch(e) {
            $state.go('buildings');
        }
        
        $scope.hideTip = function(event) {
          var $div = $('span', event.currentTarget);//angular.element('md-list-item span');
          $div.hide();
        };
        
      $scope.viewTip = function(event) {
            var $div = $('span', event.currentTarget);//angular.element('md-list-item span');
            var position = event.target.getBoundingClientRect();
            var div_width = $div.width();
            var div_height = $div.height();
            var div_offeset_top = (position.top + div_height);
            var div_offeset_left = (position.left - div_width);
            if ($window.innerHeight < div_offeset_top) {
                $div.css('top', -(div_offeset_top - $window.innerHeight ) - div_height/2 );
            }
            if ($window.innerWidth < div_offeset_left) {
                $div.css('left', -(div_width - 10));
            }
            /*if (div_offeset_left<0) {
                $div.css('left', 50);
            }*/
            $div.show();
      };
        
      $scope.getData = function() {
            Meteor.call('myFlats', $scope.email, function(err,data) {
               if (err) console.log('Error',err);
               $scope.flats = data;
               $scope.$apply();
            });
      };
      
      $scope.getData();
      
      $scope.insertPost = function(post) {
          Posts.insert(post, function(err, data) {
              if (err)
                console.log('Error inserting posts', err);
            });
        $mdDialog.hide();
        $scope.getData();
      }
      
      $scope.close = function() {
          $mdDialog.hide();
      } 
        $scope.addPost = function(flat) {
            $scope.newPost = {
                'title': $translate.instant('NEW'),
                'body': '',
                'date': new Date()
            };
            $scope.newPost.owner = Meteor.user()._id;
            $scope.newPost.by = Meteor.user();
            $scope.newPost.buildingId = flat.buildingId;
            
            
            $mdDialog.show({
             template:
               '<md-dialog aria-label="List dialog">' +
               '  <md-dialog-content layout-padding layout-margin>'+
                '    <div layout layout-sm="column">'+
                '        <md-input-container flex>'+
                '            <label>{{ "TITLE" | translate }}</label>'+
                '            <input ng-type="text" ng-model="newPost.title" required />'+
                '    </md-input-container>'+
                '    </div>'+
                '    <div layout layout-sm="column" flex>'+
                '        <md-input-container flex>'+
                '            <textarea  aria-label="{{ "TEXT" | translate }}" ng-model="newPost.body" columns="1"></textarea>'+
                '        </md-input-container>'+
                '    </div>'+
               '  </md-dialog-content>' +
               '  <md-dialog-actions>' +
               '    <md-button ng-click="close()" class="md-primary">' +
               '      Close' +
               '    </md-button>' +
               '    <md-button ng-click="insertPost(newPost)" class="md-primary">' +
               '      Add' +
               '    </md-button>' +
               '  </md-dialog-actions>' +
               '</md-dialog>',
             scope: $scope,
             preserveScope : true
            });  
        };  
    
    }
]);