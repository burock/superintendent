angular.module("super")
    .controller("DashboardCtrl", ['$scope', 
    '$meteor', '$rootScope', '$state', '$stateParams','$mdDialog','$translate', 
    function ($scope, $meteor, $rootScope, $state, $stateParams, $mdDialog, $translate) {
      
      $rootScope.building = null;
      $scope.processed = false;
      $scope.page = 1;
      $scope.perPage = 3;
      $scope.sort = {
          date: -1
      };
      $scope.start = null;
      $scope.end = null;
      $scope.buildingId = '';
      
      $scope.display = function() {
        $scope.processed = false;
        $scope.start = $scope.building.startDate;
        $scope.end = new Date();
        $scope.buildingId = $scope.building._id;
      }
      
      $meteor.autorun($scope, function() {
            $scope.$meteorSubscribe('buildings',
              {}, $stateParams.buildingId)
              .then(function(subscriptionHandle){
              $scope.buildings = $meteor.collection(Buildings);
              $scope.buildingsCount =Buildings.find().count();
            });    
        });
      
      $scope.resetFilter = function() {
          $scope.buildingId = '';
          $scope.processed = false;
          $scope.building = null;
          $scope.start = null;
          $scope.end = null;
      }
      
      //$scope.curInCash = $scope.cashflows.$$collection.find({ amount: { $gt : 0 } }, {sort : {date: 1}}).sum('amount');
      $scope.pageChanged = function(newPage) {
        $scope.page = newPage;
      };
      
      $scope.dashMe = function() {
        $scope.sumCash = 0;
        $scope.missingDues = 0;
        $scope.expenses = 0;
        $scope.dues = 0;
        $scope.sumProject = 0;
        $scope.pieData = [];
        
        $meteor.call("c4cal", $scope.start, $scope.end, $scope.building._id).then(
            function(data) {
                $scope.cashflows = data;
                data.forEach(function(cash) {
                  if (cash.amount>0) $scope.dues += cash.amount; else $scope.expenses += cash.amount;
                  $scope.sumCash += cash.amount;
                });
                $scope.pieData.push($scope.sumCash);
            },
            function(err) {
                console.log('failed', err);
            }
        );
        
        
        $meteor.call("p4cal", $scope.start, $scope.end, $scope.building._id).then(
            function(data) {
                $scope.projects = data;
                data.forEach(function(p) {
                  $scope.sumProject += p.amount;
                });
                $scope.pieData.push($scope.sumProject);
                  $scope.chartData = {
                      labels : [$translate.instant('CASHFLOWS') + ' ' + $scope.sumCash,
                                $translate.instant('PROJECTS')+ ' ' + $scope.sumProject],
                      series : $scope.pieData
                  };
                $scope.refreshChart();
            },
            function(err) {
                console.log('failed', err);
            }
        );
        
        $meteor.autorun($scope, function() {
         $scope.$meteorSubscribe('posts', {
                    limit: parseInt($scope.getReactively('perPage')),
                    skip: (parseInt($scope.getReactively('page')) - 1) * parseInt($scope.getReactively('perPage')),
                    sort: $scope.getReactively('sort')
                }, $scope.getReactively('buildingId'))
                .then(function(subscriptionHandle) {
                    $scope.posts = $meteor.collection(function() {
                        return Posts.find({}, {
                          sort : $scope.getReactively('sort')
                        });
                    });
                $scope.postsCount = $meteor.object(Counts ,'numberOfPosts', false);
            });
        });
        
        $scope.processed = true;
      }
      
      $scope.refreshChart = function() {
        var options = {
          labelInterpolationFnc: function(value) {
            return value[0]
          }
        };
        
        var responsiveOptions = [
          ['screen and (min-width: 640px)', {
            chartPadding: 30,
            labelOffset: 100,
            labelDirection: 'explode',
            labelInterpolationFnc: function(value) {
              return value;
            }
          }],
          ['screen and (min-width: 1024px)', {
            labelOffset: 80,
            chartPadding: 20
          }]
        ];
         new Chartist.Pie('.ct-chart',$scope.chartData );
      }
      
      /*
      // Use $interval to update bar chart data
      var barUpdatePromise = $interval(function() {
        console.log($scope.curInCash + " " + $scope.curInCash + " " +$scope.unfinishedProjectCosts);
      }.bind(this), 1000);
 
      // Cancel interval once scope is destroyed
      $scope.$on('$destroy', function() {
          $interval.cancel(barUpdatePromise);
      });
        */
}]);