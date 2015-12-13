angular.module("super").controller("BuildingDetailsCtrl", ['$scope', '$stateParams'
        , '$rootScope', '$state', 'uiGmapGoogleMapApi', '$translate','$reactive',
    function($scope, $stateParams, $rootScope, $state, uiGmapGoogleMapApi, $translate, $reactive) {

        // rootscope.building is retrieved @ router.ng.js
        if ($stateParams.buildingId == "") {
            $rootScope.building == null;
            $state.go('buildings');
        }
        // $rootScope.building = $scope.building;
        
        $rootScope.loadMenu($stateParams.buildingId);

        var latLng;
        var defLat = 41.0029403;
        var defLong = 28.9550193;
        // google maps is ready
        uiGmapGoogleMapApi.then(function(maps) {
            if ($rootScope.building.location) {
                if (!$rootScope.building.location.latitude) {
                    $rootScope.building.location.latitude = defLat;
                    $rootScope.building.location.longitude = defLong;
                }
                latLng = new google.maps.LatLng($rootScope.building.location.latitude,
                    $rootScope.building.location.longitude);

                $scope.marker = {
                    id: $stateParams.buildingId,
                    coords: {
                        latitude: latLng.lat(),
                        longitude: latLng.lng()
                    },
                    options: {
                        draggable: true
                    },
                    events: {
                        dragend: function(marker, eventName, args) {
                            if (!$rootScope.building.location)
                                $rootScope.building.location = {};

                            $rootScope.building.location.latitude = marker.getPosition().lat();
                            $rootScope.building.location.longitude = marker.getPosition().lng();
                            $scope.save();
                        }
                    }
                };

                $scope.$watchCollection("building.location", function(newVal, oldVal) {
                    if (_.isEqual(newVal, oldVal) || $rootScope.building == null) return;
                    //$scope.$apply(function () {
                    var ll = new google.maps.LatLng($rootScope.building.location.latitude,
                        $rootScope.building.location.longitude);
                    $scope.marker = {
                        coords: {
                            latitude: ll.lat(),
                            longitude: ll.lng()
                        }
                    };
                    $scope.map = {
                        center: {
                            latitude: ll.lat(),
                            longitude: ll.lng()
                        },
                        zoom: 16,
                        bounds: {}
                    };
                    //});
                });

            } else {
                latLng = new google.maps.LatLng(defLat, defLong);
            }

            $scope.map = {
                center: {
                    latitude: latLng.lat(),
                    longitude: latLng.lng()
                },
                zoom: 13,
                events: {
                    click: function(mapModel, eventName, originalEventArgs) {
                        /*if (!$rootScope.building)
                            return;

                        if (!$rootScope.building.location)
                            $rootScope.building.location = {};

                        $rootScope.building.location.latitude = originalEventArgs[0].latLng.lat();
                        $scope.building.location.longitude = originalEventArgs[0].latLng.lng();
                        //scope apply required because this event handler is outside of the angular domain
                        $scope.$apply();*/
                    }
                }
            };
        });

        $scope.save = function() {
            Buildings.update({_id: $stateParams.buildingId}, {
                $set : {
                    name : $scope.building.name,
                    currency: $scope.building.currency,
                    no: $scope.building.no,
                    street: $scope.building.street,
                    county: $scope.building.county,
                    zip: $scope.building.zip,
                    town: $scope.building.town,
                    country: $scope.building.country,
                    startDate: $scope.building.startDate
                }
            });
            $rootScope.showSimpleToast(this, $translate.instant('SAVED'));
        };

        $scope.deleteBuilding = function(building) {
            $rootScope.confirmDelete($translate.instant("BUILDING"), building.name).then(
                function(data) {
                    if (data) $meteor.call('removeBuilding', building._id).then(function(data) {
                        console.log('success')
                    }, function(err) {
                        console.log(err)
                    })
                    $rootScope.building = null;
                    $state.go('buildings');
                });
        };


        $scope.formattedAddress = function() {
            return $rootScope.building.name + ' ' + $rootScope.building.no + ' ' + $rootScope.building.street;
        };

    }
]);

angular.module("super").controller("MapController", ['$scope', '$rootScope', '$translate',
    function($scope, $rootScope, $translate) {
        // geocode the given address
        var geocodeAddress = function(address, callback) {
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({
                'address': address
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    callback(results[0].geometry.location);
                } else {
                    $rootScope.showSimpleToast(this, "Sorry! Couldn't spot your address");
                    console.log("Geocode was not successful for the following reason: " + status);
                }
            });
        };


        $scope.search = function(map) {
            var address = $rootScope.building.no + ' ' + $rootScope.building.street + ' ' + $rootScope.building.county + ' ' + $rootScope.building.town + ', ' + $rootScope.building.zip;
            $scope.map = map;

            geocodeAddress(address, function(ll) {
                if (!$rootScope.building.location)
                    $rootScope.building.location = {};
                $rootScope.showSimpleToast(this, $translate.instant('FOUND_MAP'))

                // $scope.$apply(function() {
                $rootScope.building.location.latitude = ll.lat();
                $rootScope.building.location.longitude = ll.lng();
                //});

            });
        }
    }
]);