angular.module("super").config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
    function($urlRouterProvider, $stateProvider, $locationProvider) {

        $locationProvider.html5Mode(true);

        $stateProvider
            .state('buildings', {
                url: '/buildings',
                templateUrl: 'client/buildings/views/buildings-list.ng.html',
                controller: 'BuildingsListCtrl',
                resolve: {
                    currentUser: ($q) => {
                        if (Meteor.userId() == null) {
                          return $q.reject('AUTH_REQUIRED');
                        }
                        else {
                          return $q.resolve();
                        }
                    }
                }
            })
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: 'client/dashboard.ng.html',
                controller: 'DashboardCtrl',
                resolve: {
                    currentUser: ($q) => {
                        if (Meteor.userId() == null) {
                          return $q.reject('AUTH_REQUIRED');
                        }
                        else {
                          return $q.resolve();
                        }
                    }
                }
            })
            .state('myflats', {
                url: '/myflats',
                templateUrl: 'client/flats/views/myflats-list.ng.html',
                controller: 'MyFlatsListCtrl',
                resolve: {
                    currentUser: ($q) => {
                        if (Meteor.userId() == null) {
                          return $q.reject('AUTH_REQUIRED');
                        }
                        else {
                          return $q.resolve();
                        }
                    }
                }
            })
            .state('reminders', {
                url: '/buildings/:buildingId/reminders',
                templateUrl: 'client/reminders/views/reminders.ng.html',
                controller: 'EventCalendarController',
                controllerAs: "eventCtrl",
                resolve: {
                    currentUser: ($q) => {
                        if (Meteor.userId() == null) {
                          return $q.reject('AUTH_REQUIRED');
                        }
                        else {
                          return $q.resolve();
                        }
                    }
                }
            })
            .state('buildingDetails', {
                url: '/buildings/:buildingId',
                templateUrl: 'client/buildings/views/building-details.ng.html',
                controller: 'BuildingDetailsCtrl',
                resolve: {
                    currentUser: ($q) => {
                        if (Meteor.userId() == null) {
                          return $q.reject('AUTH_REQUIRED');
                        }
                        else {
                          return $q.resolve();
                        }
                    },
                    "singleBuildingSubscription":  ['$q', function ($q) {
                          var deferred = $q.defer();
                     
                          Meteor.subscribe('buildings', {
                            onReady: deferred.resolve,
                            onStop: deferred.reject
                          });

                        return deferred.promise;
                    }],
                    "building": ['$meteor', '$rootScope', '$stateParams', '$q',
                        'singleBuildingSubscription','$reactive',
                        function($meteor, $rootScope, $stateParams, $q,
                                singleBuildingSubscription,$reactive) {
                            /*var b = $meteor.object(Buildings, $stateParams.buildingId, false);
                            */
                            var deferred = $q.defer();
                            
                            console.log(Buildings.find().count());
                            
                            $reactive(this).helpers({
                              b : () => Buildings.findOne({_id: $stateParams.buildingId})
                            });
                            
                            var bb = this.b;
                            if (!bb._id) {
                                console.log('NOT_FOUND');
                                deferred.reject('NOT_FOUND');
                                return deferred.promise;
                            }
                            $rootScope.building = bb;
                            return bb;
                        }
                    ]
                }
            })
            .state('flats', {
                url: '/buildings/:buildingId/flats',
                templateUrl: 'client/flats/views/flats-list.ng.html',
                controller: 'FlatsListCtrl',
                resolve: {
                    currentUser: ($q) => {
                        if (Meteor.userId() == null) {
                          return $q.reject('AUTH_REQUIRED');
                        }
                        else {
                          return $q.resolve();
                        }
                    }
                }
            })
            .state('cashflows', {
                url: '/buildings/:buildingId/cashflows/:cashflowId',
                templateUrl: 'client/cashflows/views/cashflows-list.ng.html',
                controller: 'CashflowsListCtrl',
                resolve: {
                    currentUser: ($q) => {
                        if (Meteor.userId() == null) {
                          return $q.reject('AUTH_REQUIRED');
                        }
                        else {
                          return $q.resolve();
                        }
                    }
                }
            })
            .state('posts', {
                url: '/buildings/:buildingId/posts',
                templateUrl: 'client/posts/views/posts-list.ng.html',
                controller: 'PostsListCtrl',
                resolve: {
                    currentUser: ($q) => {
                        if (Meteor.userId() == null) {
                          return $q.reject('AUTH_REQUIRED');
                        }
                        else {
                          return $q.resolve();
                        }
                    }
                }
            })
            .state('projects', {
                url: '/buildings/:buildingId/projects/:projectId',
                templateUrl: 'client/projects/views/projects-list.ng.html',
                controller: 'ProjectsListCtrl',
                resolve: {
                    currentUser: ($q) => {
                        if (Meteor.userId() == null) {
                          return $q.reject('AUTH_REQUIRED');
                        }
                        else {
                          return $q.resolve();
                        }
                    }
                }
            })
            .state('login', {
                url: '/login',
                templateUrl: 'client/users/views/login.ng.html',
                controller: 'LoginCtrl',
                controllerAs: 'lc'
            })
            .state('register', {
                url: '/register',
                templateUrl: 'client/users/views/register.ng.html',
                controller: 'RegisterCtrl',
                controllerAs: 'rc'
            })
            .state('resetpw', {
                url: '/resetpw',
                templateUrl: 'client/users/views/reset-password.ng.html',
                controller: 'ResetCtrl',
                controllerAs: 'rpc'
            })
            .state('logout', {
                url: '/logout',
                resolve: {
                    logout: function($meteor, $state) {
                        return Accounts.logout().then(function() {
                            $state.go('login');
                        }, function(err) {
                            console.log('logout error - ', err);
                        });
                    }
                }
            });

        $urlRouterProvider.otherwise("/login");
        
    }
]);