angular.module("super")
    .controller("DashboardCtrl", ['$scope', 
     '$rootScope','$translate', '$reactive','$window','$state','$mdSidenav',
    function ($scope, $rootScope, $translate, $reactive,$window, $state, $mdSidenav) {
      $reactive(this).attach($scope);
      $scope.showPosts = true;
      $rootScope.building = null;
      $scope.subscribe('buildings');
      $scope.processed = false;
      $scope.searchOn = true;
      $scope.months = [$translate.instant('JAN'),$translate.instant('FEB'),$translate.instant('MAR'),
                            $translate.instant('APR'),$translate.instant('MAY'),$translate.instant('JUN'),
                            $translate.instant('JUL'),$translate.instant('AUG'),$translate.instant('SEP'),
                            $translate.instant('OCT'),$translate.instant('NOV'),$translate.instant('DEC'),];
      $scope.perPage = 6;
      $scope.start = new Date();
      $scope.end = new Date();
      $scope.buildingId = '';
      $scope.page = 1;
      $scope.sort = {
            date: -1
          };
      
      $scope.helpers({
          buildings : () => {
            return Buildings.find({}, { sort : { name : 1 }});
          },
          postsCount: () => { return Counts.get('numberOfPosts'); },
          posts: () => { return Posts.find({ buildingId: $scope.getReactively('buildingId') }, { sort: $scope.getReactively('sort') } ) },
        });

      $scope.toggleSearch = function() {
          $scope.searchOn = !$scope.searchOn;
      };

      $scope.editPost = function (post) {
          $scope.showPosts=false;
          $scope.newPost = post;
          $scope.$broadcast('postEvent', post._id);
      };
      
      $scope.flip = function() {
			  $scope.showPosts = !$scope.showPosts;
		  };
      
      $scope.addPost = function() {
          $scope.showPosts = false;
            $scope.newPost = {
                'title': $translate.instant('NEW'),
                'body': '',
                'date': new Date()
            };
            $scope.newPost.owner = $rootScope.cUser._id;
            $scope.newPost.by = $rootScope.cUser;
            $scope.newPost.buildingId = $scope.buildingId;
            
            Posts.insert($scope.newPost, function(err, data) {
              if (err)
                console.log('Error inserting posts', err);
              else {
                $scope.$broadcast('postEvent', data);
              }
            });
        };
        
      $scope.display = function() {
        $scope.showPosts = true;
        $scope.processed = false;
        $scope.start = $scope.building.startDate;
        $scope.end = new Date();
        $scope.buildingId = $scope.building._id;
        $rootScope.loadMenu($scope.building._id);
        $scope.subscribe('posts', () => {
            return [
                {
                    buildingId: $scope.getReactively('buildingId')
                },
                {
                    limit: parseInt($scope.perPage),
                    skip: (parseInt($scope.page) - 1) * parseInt($scope.perPage),
                    sort: $scope.sort
                }
            ]
        });
      }
    
      $scope.resetFilter = function() {
          $scope.buildingId = '';
          $scope.building = null;
          $scope.processed = false;
          //$scope.start = null;
          //$scope.end = null;
      }
      
      $scope.pageChanged = function(newPage) {
        $scope.page = newPage;
      };
      
      $scope.dashMe = function() {
        if (!$scope.buildingId) return ;
        $mdSidenav('dashboardLeft').close()
          .then(function () {
          });
        $scope.sumCash = 0;
        $scope.missingDues = 0;
        $scope.expenses = 0;
        $scope.income = 0;
        $scope.sumProject = 0;
        $scope.pieData = [];
        
        Meteor.call("getYearTotal", $scope.buildingId, function(err, data) {
            $scope.yearTotal = data;
            $scope.refreshBarChart();
        });
        
        Meteor.call("c4cal", $scope.start, $scope.end, $scope.buildingId, function(err, data) {
            if (err)
              console.log('Error at c4cal', err);
            else {
              $scope.cashflows = data;
              $scope.$apply(function() {
                data.forEach(function(cash) {
                  
                  if (cash.amount>0) $scope.income += cash.amount; else $scope.expenses += cash.amount;
                  $scope.sumCash += cash.amount;
                });
                
                $scope.pieData.push(Math.abs($scope.sumCash));
              });
            }
        });
        
        
        Meteor.call("p4cal", $scope.start, $scope.end, $scope.buildingId, function(err, data) {
            if (err)
              console.log('Error at p4cal', err);
            else {
                $scope.projects = data;
                data.forEach(function(p) {
                  $scope.$apply(function() {
                    $scope.sumProject += p.amount;
                  });
                });
                $scope.pieData.push(Math.abs($scope.sumProject));
            }
            $scope.refreshPieChart();
        });
        
        Meteor.call("findDebts", $scope.buildingId, function(err, data) {
            $scope.missingDues = data;
        });

        $scope.processed = true;
      };
      
      $scope.refreshPieChart = function() {
        $scope.chartData = {
              labels : [
                        $translate.instant('BALANCE') + ' ' + $scope.sumCash,
                        $translate.instant('PROJECTS')+ ' ' + $scope.sumProject
                        ],
              series : $scope.pieData
        };
        var sum = function(a, b) { return a + b };
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
        new Chartist.Pie('.ct-chart',$scope.chartData, {
            showLabel: true
        });
      };
      
      $scope.refreshBarChart = function() {
        var li = [];
        var si = [];
        $scope.yearTotal[0].series.forEach(function(e) {
          li.push($scope.months[e.date.month-1]);
          si.push(e.total);
        });
        
        var le = [];
        var se = [];
        $scope.yearTotal[1].series.forEach(function(e) {
          le.push($scope.months[e.date.month-1]);
          se.push((-1*e.total));
        });
        var barChart = new Chartist.Bar('.ct-bar-chart', {
            labels: li,
            series: [
              se,
              si
            ]
          }, {
            //seriesBarDistance: 5,
            //horizontalBars: true,
            height: '250px'
          });
          
      };
      
      $scope.toggleMenu = function() {
        $mdSidenav('dashboardLeft').toggle();
      };
      
}]);