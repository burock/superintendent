'use strict';

angular.module('super', ['angular-meteor', 'ui.router', 'ngMaterial',
    'uiGmapgoogle-maps', 'ngCookies', 'pascalprecht.translate',
    'angularUtils.directives.dirPagination', 'ui.calendar'
]);
angular.module('super').config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyCLbGNtXqwvk1N_-c_CFPL-Kdq-mFkG_mo',
        v: '3.20',
    });
});
angular.module('super').config(['$translateProvider',
    function($translateProvider) {

        $translateProvider
            .useStaticFilesLoader({
                prefix: '/locale/',
                suffix: '.json'
            })
            .registerAvailableLanguageKeys(['en','tr','al'], {
                'en': 'en',
                'tr'  : 'tr',
                'al'  : 'al'
            })
            .preferredLanguage('tr')
            .fallbackLanguage('en');
        $translateProvider.useSanitizeValueStrategy('escape');

    }
]);

angular.module('super')
    .factory('menu', [
        '$location', '$rootScope', '$translate',
        function($location, $rootScope, $translate) {
            var self;

            return self = {
                sections: $rootScope.sections,

                toggleSelectSection: function(section) {
                    self.openedSection = (self.openedSection === section ? null : section);
                },
                isSectionSelected: function(section) {
                    return self.openedSection === section;
                },

                selectPage: function(section, page) {
                    page && page.url && $location.path(page.url);
                    self.currentSection = section;
                    self.currentPage = page;
                }
            };
        }
    ]);


// *** Navigation controller
angular.module("super")
    .controller("NavCtrl", [
        '$rootScope',
        '$log',
        '$state',
        '$timeout',
        '$location',
        '$scope',
        'menu', '$stateParams',
        function($rootScope, $log, $state, $timeout, $location, $scope, menu, $stateParams) {

            var vm = this;

            vm.isOpen = isOpen;
            vm.toggleOpen = toggleOpen;
            vm.isSectionSelected = isSectionSelected;
            vm.autoFocusContent = false;
            vm.menu = menu;
            vm.status = {
                isFirstOpen: true,
                isFirstDisabled: false
            };

            function isOpen(section) {
                return menu.isSectionSelected(section);
            }

            function toggleOpen(section) {
                menu.toggleSelectSection(section);
            }

            function isSectionSelected(section) {
                var selected = false;
                var openedSection = menu.openedSection;
                if (openedSection === section) {
                    selected = true;
                } else if (section.children) {
                    section.children.forEach(function(childSection) {
                        if (childSection === openedSection) {
                            selected = true;
                        }
                    });
                }
                return selected;
            }
        }
    ]).filter('nospace', function() {
        return function(value) {
            return (!value) ? '' : value.replace(/ /g, '');
        };
    })
    //replace uppercase to regular case
    .filter('humanizeDoc', function() {
        return function(doc) {
            if (!doc) return;
            if (doc.type === 'directive') {
                return doc.name.replace(/([A-Z])/g, function($1) {
                    return '-' + $1.toLowerCase();
                });
            }
            return doc.label || doc.name;
        };
    });

var themeIcons = ['$mdIconProvider', function($mdIconProvider) {
    $mdIconProvider
        .iconSet("social", "/packages/planettraining_material-design-icons/bower_components/material-design-icons/sprites/svg-sprite/svg-sprite-social.svg")
        .iconSet("action", "/packages/planettraining_material-design-icons/bower_components/material-design-icons/sprites/svg-sprite/svg-sprite-action.svg")
        .iconSet("communication", "/packages/planettraining_material-design-icons/bower_components/material-design-icons/sprites/svg-sprite/svg-sprite-communication.svg")
        .iconSet("content", "/packages/planettraining_material-design-icons/bower_components/material-design-icons/sprites/svg-sprite/svg-sprite-content.svg")
        .iconSet("toggle", "/packages/planettraining_material-design-icons/bower_components/material-design-icons/sprites/svg-sprite/svg-sprite-toggle.svg")
        .iconSet("navigation", "/packages/planettraining_material-design-icons/bower_components/material-design-icons/sprites/svg-sprite/svg-sprite-navigation.svg")
        .iconSet("image", "/packages/planettraining_material-design-icons/bower_components/material-design-icons/sprites/svg-sprite/svg-sprite-image.svg");
}];

angular.module('super').config(themeIcons);

angular.module('super').config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('blue-grey', {
            'default': '800',
        }).accentPalette('deep-orange', {
            'default': '900'
        }).backgroundPalette('grey', {
            'default': '50'
        });
});

angular.module('super').run(

    function($rootScope, $state, $mdToast, $translate, $mdDialog) {

        $rootScope.showSimpleToast = function(scope, message) {
            $mdToast.show(
                $mdToast.simple()
                .content(message)
                //.position(getToastPosition(scope))
                .hideDelay(3000)
            );
        };

        $rootScope.vacuum = function() {
            $rootScope.building = null;
        };

        $rootScope.$on('$stateChangeError',
            function(event, toState, toParams, fromState, fromParams, error) {
                // We can catch the error thrown when the $requireUser promise is rejected
                // and redirect the user back to the main page
                console.warn( "Route failed!" ,error);
                // Warning: On error, the $routeParams are NOT updated; however,
                // the $route.current.params and $route.current.pathParams ARE
                // updated to reflect even the failed route.
                if (error === 'AUTH_REQUIRED') {
                    $state.go('login');
                } else {
                    if ($rootScope.currentUser) {
                        $state.go('buildings');
                    } else
                        $state.go('login');
                }
            });
            
    
        $rootScope.building = null;
        $rootScope.words = [];
        $translate(['WOULD_U_LIKE_TO_DELETE_THIS', 'PROJECT', 'BUILDING',
            'CASHFLOW', 'FLAT', 'POST', 'REGISTER', 'LOGOUT', 'LOGIN', 'BUILDINGS',
            'DASHBOARD', 'YES', 'NO', 'U_DELETED'
        ]).then(function(words) {
            $rootScope.words = words;
        });

        $rootScope.confirmDelete = function(what, description) {
            var confirm = $mdDialog.confirm()
                .title($rootScope.words["WOULD_U_LIKE_TO_DELETE_THIS"] + ' ' + what.toLowerCase() + '?')
                .ok($rootScope.words["YES"])
                .cancel($rootScope.words["NO"]);
            return $mdDialog.show(confirm).then(function() {
                var s = $rootScope.words["U_DELETED"] + what.toLowerCase() + ' \'' + description + '\'';
                $rootScope.showSimpleToast($rootScope, s);
                return true;
            }, function() {
                $rootScope.showSimpleToast($rootScope, $translate.instant("CANCELLED"));
                return false;
            });
        }
        $rootScope.loadMenu = function(buildingId) {
            $rootScope.sections = [];
            $rootScope.sections.push({
                name: 'BUILDING',
                type: 'link',
                buildingId: buildingId,
                state: 'buildingDetails',
                icon: 'business'
            }, {
                name: 'FLATS',
                type: 'link',
                buildingId: buildingId,
                state: 'flats',
                icon: 'view_headline'
            }, {
                name: 'CASHFLOWS',
                state: 'cashflows',
                buildingId: buildingId,
                type: 'link',
                icon: 'local_atm'
            }, {
                name: 'REMINDERS',
                state: 'reminders',
                buildingId: buildingId,
                type: 'link',
                icon: 'notifications'
            }, {
                name: 'POSTS',
                state: 'posts',
                buildingId: buildingId,
                type: 'link',
                icon: 'forum'
            }, {
                name: 'PROJECTS',
                state: 'projects',
                buildingId: buildingId,
                type: 'link',
                icon: 'lightbulb_outline'
            });
        };
        $rootScope.$on('$translateChangeSuccess', function() {
           // console.log("here...");
        });

    });