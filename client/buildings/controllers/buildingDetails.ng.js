angular.module("super").controller("BuildingDetailsCtrl", ['$scope', '$stateParams'
        , '$rootScope', '$state', '$translate','$reactive', 'building',
    function($scope, $stateParams, $rootScope, $state, $translate, $reactive, building) {

        // rootscope.building is retrieved @ router.ng.js
        if ($stateParams.buildingId == "") {
            $scope.building == null;
            $state.go('buildings');
        }
        $scope.building = building;
        $rootScope.building = building;
        $rootScope.loadMenu($stateParams.buildingId);
        var defLat = 41.0029403;
        var defLong = 28.9550193;
        var latLng = { latitude: defLat, longitude: defLong};
        $scope.formattedAddress = function() {
            return $scope.building.name + ' ' + $scope.building.no + ' ' + $scope.building.street;
        };
        
        $scope.createMarker = function(event) {
            if (!$scope.building.location) {
                $scope.building.location = { latitude: defLat, longitude: defLong};
            }
            var lat = parseFloat($scope.building.location.latitude);
            var lng = parseFloat($scope.building.location.longitude);
            if (event) {
                lat = event.latlng.lat;
                lng = event.latlng.lng;
            }
            if (!$scope.marker) {            
                $scope.marker = L.marker(new L.LatLng(lat, lng),{
                    title: $scope.building.name,
                    description: $scope.formattedAddress(),
                    icon : L.mapbox.marker.icon({
                        'marker-color': '2196F3',
                        'marker-symbol': 'commercial'
                    }),
                    draggable: true
                });
                $scope.marker.addTo($scope.map);
                $scope.marker.on('dragend', function(e) {
                    var m = $scope.marker.getLatLng();
                    $scope.building.location.latitude = m.lat;
                    $scope.building.location.longitude = m.lng;
                    $scope.save();
                });
            } else {
                $scope.marker.setLatLng({ lat: lat, lng: lng});
            }
            $scope.map.panTo([lat, lng]);
        };

        L.mapbox.accessToken = 'pk.eyJ1IjoiYnVyb2NrIiwiYSI6ImNpaXUydm1oZjAwMG12N2x6ODNxdWdteHAifQ.7dFRESXwzGv7Bf5E7PLTZQ';
        $scope.map = new L.mapbox.Map('map', 'burock.ok303cgl', {
            center: [defLat, defLong],
            zoom: 16,
            doubleClickZoom: false,
            trackResize: true
        });
        $scope.map.on('layeradd', function(e) {
           setTimeout(function(){ $scope.map.invalidateSize(true);}, 400);
        }); 
        $scope.map.on('load', function(e) {
           setTimeout(function(){ $scope.map.invalidateSize(true);}, 400);
        });
        /*$scope.geocoderControl = L.mapbox.geocoderControl('mapbox.places', {
            autocomplete: true
        });
        $scope.geocoderControl.addTo($scope.map);
        $scope.geocoderControl.on('found', function(res) {
        });*/
        $scope.map.on('dblclick', function(e) {
            $scope.createMarker(e);
        });
        $scope.createMarker();
        
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
                    startDate: $scope.building.startDate,
                    location: $scope.building.location
                }
            });
            $rootScope.showSimpleToast(this, $translate.instant('SAVED'));
        };

        $scope.deleteBuilding = function(building) {
            $rootScope.confirmDelete($translate.instant("BUILDING"), building.name).then(
                function(data) {
                    if (data) Meteor.call('removeBuilding', building._id, function(data) {
                    });
                    $scope.building = null;
                    $state.go('buildings');
                });
        };
        
    }
]);
