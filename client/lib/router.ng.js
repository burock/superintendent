angular.module("super").config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
    function($urlRouterProvider, $stateProvider, $locationProvider) {

        $locationProvider.html5Mode(true);

        $stateProvider
            .state('legal', {
                url: '/buildings/:buildingId/legal',
                templateUrl: 'client/legal/views/legal.ng.html',
                controller: 'LegalCtrl',
                resolve: {
                    cUser: ($q) => {
                        if (Meteor.userId() == null) {
                          return $q.reject('AUTH_REQUIRED');
                        }
                        else {
                          return $q.resolve();
                        }
                    }
                }
            })
            .state('buildings', {
                url: '/buildings',
                templateUrl: 'client/buildings/views/buildings-list.ng.html',
                controller: 'BuildingsListCtrl',
                resolve: {
                    cUser: ($q) => {
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
                    cUser: ($q) => {
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
                    cUser: ($q) => {
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
                    cUser: ($q) => {
                        if (Meteor.userId() == null) {
                          return $q.reject('AUTH_REQUIRED');
                        }
                        else {
                          return $q.resolve();
                        }
                    },
                    singleBuildingSubscription:  ['$q', function ($q) {
                          var deferred = $q.defer();
                     
                          Meteor.subscribe('buildings', {
                            onReady: deferred.resolve,
                            onStop: deferred.reject
                          });

                        return deferred.promise;
                    }],
                    building: ['$stateParams', '$q',
                        'singleBuildingSubscription','$reactive',
                        function( $stateParams, $q,
                                singleBuildingSubscription,$reactive) {
                            $reactive(this).helpers({
                              b : () => Buildings.findOne({_id:  $stateParams.buildingId})
                            });
                            //this.b = Buildings.findOne({},{_id: $stateParams.buildingId});
                            var deferred = $q.defer();
                            if (!this.b._id) {
                                deferred.reject('NOT_FOUND');
                                return deferred.promise;
                            }
                            return this.b;
                        }
                    ]
                }
            })
            .state('flats', {
                url: '/buildings/:buildingId/flats',
                templateUrl: 'client/flats/views/flats-list.ng.html',
                controller: 'FlatsListCtrl',
                resolve: {
                    cUser: ($q) => {
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
                    cUser: ($q) => {
                        if (Meteor.userId() == null) {
                          return $q.reject('AUTH_REQUIRED');
                        }
                        else {
                          return $q.resolve();
                        }
                    }
                }
            })
            .state('cashflowimport', {
                url: '/buildings/:buildingId/cashflowimport',
                templateUrl: 'client/cashflows/views/cashflow-import.ng.html',
                controller: 'CashflowImportCtrl',
                resolve: {
                    cUser: ($q) => {
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
                url: '/buildings/:buildingId/posts/:postId',
                templateUrl: 'client/posts/views/posts-list.ng.html',
                controller: 'PostsListCtrl',
                resolve: {
                    cUser: ($q) => {
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
                    cUser: ($q) => {
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
                    logout: function($state) {
                        Meteor.logout(function() {
                            $state.go('login', {}, {reload: true});
                        });
                    }
                }
            })
            .state('myflats', {
                url: '/myflats',
                templateUrl: 'client/flats/views/myflats.ng.html',
                controller: 'MyFlatsCtrl',
                resolve: {
                    cUser: ($q) => {
                        if (Meteor.userId() == null) {
                          return $q.reject('AUTH_REQUIRED');
                        }
                        else {
                          return $q.resolve();
                        }
                    }
                }
            });

        $urlRouterProvider.otherwise("/login");
        
    }
]);